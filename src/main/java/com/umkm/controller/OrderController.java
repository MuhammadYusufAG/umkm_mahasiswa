package com.umkm.controller;

import com.umkm.entity.*;
import com.umkm.repository.OrderRepository;
import com.umkm.repository.ProductRepository;
import com.umkm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

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

    @PostMapping
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO request) {
        try {
            User buyer = getAuthenticatedUser();
            if (buyer == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Harap login terlebih dahulu");
            }

            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Pesanan kosong");
            }

            // Ambil produk pertama untuk menentukan seller (asumsi satu order untuk satu seller)
            Long firstProductId = request.getItems().get(0).getProductId();
            Optional<Product> productOpt = productRepository.findById(firstProductId);
            
            if (productOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Produk tidak ditemukan");
            }
            User seller = productOpt.get().getSeller();

            // Validasi: Pastikan semua produk berasal dari penjual yang sama
            for (OrderItemRequestDTO itemDto : request.getItems()) {
                Optional<Product> pOpt = productRepository.findById(itemDto.getProductId());
                if (pOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Produk tidak ditemukan");
                }
                if (!pOpt.get().getSeller().getId().equals(seller.getId())) {
                    return ResponseEntity.badRequest().body("Gagal membuat pesanan. Anda hanya dapat memesan produk dari satu penjual yang sama dalam satu transaksi.");
                }
            }

            Order order = new Order();
            order.setBuyer(buyer);
            order.setSeller(seller);
            order.setBuyerName(buyer.getUsername());
            order.setSellerName(seller.getUsername());
            order.setNotes(request.getNotes());
            order.setStatus(OrderStatus.BARU);

            BigDecimal total = BigDecimal.ZERO;

            for (OrderItemRequestDTO itemDto : request.getItems()) {
                Optional<Product> pOpt = productRepository.findById(itemDto.getProductId());
                if (pOpt.isPresent()) {
                    Product p = pOpt.get();
                    OrderItem item = new OrderItem();
                    item.setOrder(order);
                    item.setProduct(p);
                    item.setProductName(p.getName());
                    item.setProductImageUrl(p.getImageUrl());
                    item.setPrice(p.getPrice());
                    item.setQuantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1);
                    item.setNotes(itemDto.getNotes());
                    order.getItems().add(item);

                    total = total.add(p.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
                }
            }

            order.setTotalPrice(total);
            Order savedOrder = orderRepository.save(order);

            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Terjadi kesalahan di server: " + e.getMessage());
        }
    }

    @GetMapping("/buyer")
    public ResponseEntity<?> getBuyerOrders() {
        User buyer = getAuthenticatedUser();
        if (buyer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller")
    public ResponseEntity<?> getSellerOrders() {
        User seller = getAuthenticatedUser();
        if (seller == null || seller.getRole() != Role.SELLER) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller/count/new")
    public ResponseEntity<?> countNewOrders() {
        User seller = getAuthenticatedUser();
        if (seller == null || seller.getRole() != Role.SELLER) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        long count = orderRepository.countBySellerIdAndStatus(seller.getId(), OrderStatus.BARU);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/process")
    public ResponseEntity<?> processOrder(@PathVariable Long id) {
        User seller = getAuthenticatedUser();
        if (seller == null || seller.getRole() != Role.SELLER) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        if (!order.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        order.setStatus(OrderStatus.DIPROSES);
        orderRepository.save(order);
        
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        User seller = getAuthenticatedUser();
        if (seller == null || seller.getRole() != Role.SELLER) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        if (!order.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        order.setStatus(OrderStatus.SELESAI);
        orderRepository.save(order);
        
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        User seller = getAuthenticatedUser();
        if (seller == null || seller.getRole() != Role.SELLER) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        if (!order.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        order.setStatus(OrderStatus.DIBATALKAN);
        orderRepository.save(order);
        
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<?> updateNotes(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User buyer = getAuthenticatedUser();
        if (buyer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        if (!order.getBuyer().getId().equals(buyer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        String newNote = payload.get("notes");
        if (newNote != null && !newNote.trim().isEmpty()) {
            String currentNotes = order.getNotes() == null ? "" : order.getNotes() + "\n";
            order.setNotes(currentNotes + "- " + newNote.trim());
            orderRepository.save(order);
        }
        
        return ResponseEntity.ok(order);
    }

    // DTO classes
    public static class OrderRequestDTO {
        private String notes;
        private List<OrderItemRequestDTO> items;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public List<OrderItemRequestDTO> getItems() { return items; }
        public void setItems(List<OrderItemRequestDTO> items) { this.items = items; }
    }

    public static class OrderItemRequestDTO {
        private Long productId;
        private Integer quantity;
        private String notes;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
