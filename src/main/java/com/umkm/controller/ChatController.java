package com.umkm.controller;

import com.umkm.dto.ChatMessageDTO;
import com.umkm.dto.ChatMessagePayload;
import com.umkm.entity.ChatMessage;
import com.umkm.entity.Order;
import com.umkm.entity.User;
import com.umkm.repository.ChatMessageRepository;
import com.umkm.repository.OrderRepository;
import com.umkm.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public ChatController(ChatMessageRepository chatMessageRepository, OrderRepository orderRepository, SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.orderRepository = orderRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElse(null);
    }

    // REST Endpoint to fetch history
    @GetMapping("/api/chat/{orderId}")
    public ResponseEntity<?> getChatHistory(@PathVariable Long orderId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        // Basic authorization check: user must be the buyer or the seller
        if (!order.getBuyer().getId().equals(user.getId()) && !order.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
        }

        List<ChatMessage> messages = chatMessageRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        List<ChatMessageDTO> dtos = messages.stream().map(this::convertToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // WebSocket STOMP endpoint
    @MessageMapping("/chat/{orderId}/send")
    public void sendMessage(@DestinationVariable Long orderId, @Payload ChatMessagePayload payload, Principal principal) {
        if (principal == null) return;
        
        String username = principal.getName();
        User user = userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username)).orElse(null);
        if (user == null) return;

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return;

        // Determine role based on user matching buyer or seller
        String role = null;
        if (order.getBuyer().getId().equals(user.getId())) {
            role = "BUYER";
        } else if (order.getSeller().getId().equals(user.getId())) {
            role = "SELLER";
        }

        if (role == null) return; // Not authorized

        ChatMessage message = new ChatMessage();
        message.setOrder(order);
        message.setSenderRole(role);
        message.setContent(payload.getContent());
        chatMessageRepository.save(message);

        ChatMessageDTO dto = convertToDto(message);
        messagingTemplate.convertAndSend("/topic/chat/" + orderId, dto);
    }

    private ChatMessageDTO convertToDto(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setOrderId(message.getOrder().getId());
        dto.setSenderRole(message.getSenderRole());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}
