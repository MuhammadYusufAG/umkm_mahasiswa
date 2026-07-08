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

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

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

            // Validasi Stok: Pastikan semua produk memiliki stok yang cukup
            for (OrderItemRequestDTO itemDto : request.getItems()) {
                Optional<Product> pOpt = productRepository.findById(itemDto.getProductId());
                if (pOpt.isPresent()) {
                    Product p = pOpt.get();
                    int requestedQty = itemDto.getQuantity() != null ? itemDto.getQuantity() : 1;
                    if (p.getStock() == 0) {
                        return ResponseEntity.badRequest().body("Stok produk '" + p.getName() + "' telah habis!");
                    } else if (p.getStock() < requestedQty) {
                        return ResponseEntity.badRequest().body("Stok produk '" + p.getName() + "' tidak mencukupi. Sisa stok: " + p.getStock());
                    }
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
                    int requestedQty = itemDto.getQuantity() != null ? itemDto.getQuantity() : 1;
                    
                    // Deduct stock
                    p.setStock(p.getStock() - requestedQty);
                    productRepository.save(p);

                    OrderItem item = new OrderItem();
                    item.setOrder(order);
                    item.setProduct(p);
                    item.setProductName(p.getName());
                    item.setProductImageUrl(p.getImageUrl());
                    item.setPrice(p.getPrice());
                    item.setQuantity(requestedQty);
                    item.setNotes(itemDto.getNotes());
                    order.getItems().add(item);

                    total = total.add(p.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
                }
            }

            order.setTotalPrice(total);
            Order savedOrder = orderRepository.save(order);

            // Send real-time order notification via WebSocket
            try {
                messagingTemplate.convertAndSend("/topic/orders/" + seller.getId(), "new-order");
            } catch (Exception e) {
                System.err.println("Gagal mengirim notifikasi WebSocket: " + e.getMessage());
            }

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

    @GetMapping("/seller/count/summary")
    public ResponseEntity<?> getSellerOrdersSummary() {
        User seller = getAuthenticatedUser();
        if (seller == null || seller.getRole() != Role.SELLER) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        long baruCount = orderRepository.countBySellerIdAndStatus(seller.getId(), OrderStatus.BARU);
        long diprosesCount = orderRepository.countBySellerIdAndStatus(seller.getId(), OrderStatus.DIPROSES);
        return ResponseEntity.ok(Map.of(
            "baru", baruCount,
            "diproses", diprosesCount
        ));
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
    @org.springframework.transaction.annotation.Transactional
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

        if (order.getStatus() == OrderStatus.DIBATALKAN) {
            return ResponseEntity.badRequest().body("Pesanan sudah dibatalkan sebelumnya");
        }
        if (order.getStatus() == OrderStatus.SELESAI) {
            return ResponseEntity.badRequest().body("Pesanan yang sudah selesai tidak dapat dibatalkan");
        }

        // Kembalikan stok untuk semua item
        for (OrderItem item : order.getItems()) {
            Product p = item.getProduct();
            if (p != null) {
                p.setStock(p.getStock() + item.getQuantity());
                productRepository.save(p);
            }
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

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
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

        if (order.getStatus() != OrderStatus.SELESAI && order.getStatus() != OrderStatus.DIBATALKAN) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Hanya pesanan yang selesai atau dibatalkan yang dapat dihapus."));
        }

        orderRepository.delete(order);
        return ResponseEntity.ok(Map.of("message", "Pesanan berhasil dihapus."));
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
