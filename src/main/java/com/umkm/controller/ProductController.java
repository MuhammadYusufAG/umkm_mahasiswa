package com.umkm.controller;

import com.umkm.entity.Product;
import com.umkm.security.CustomUserDetails;
import com.umkm.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping("/stream")
    public SseEmitter streamProducts() {
        SseEmitter emitter = new SseEmitter(0L); // timeout infinite
        emitters.add(emitter);
        
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));
        
        return emitter;
    }

    private void broadcastProductUpdate() {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("product-update").data("updated"));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }

    @GetMapping("/public")
    public ResponseEntity<List<Product>> getActiveProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/seller")
    public ResponseEntity<List<Product>> getSellerProducts(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(productService.getProductsBySeller(userDetails.getUser().getId()));
    }

    @PostMapping("/seller")
    public ResponseEntity<Product> addProduct(@RequestBody Product product, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Product saved = productService.addProduct(product, userDetails.getUser());
        broadcastProductUpdate();
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/seller/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Product updated = productService.updateProduct(id, product, userDetails.getUser());
        broadcastProductUpdate();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/seller/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        productService.deleteProduct(id, userDetails.getUser());
        broadcastProductUpdate();
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/seller/{id}/toggle-status")
    public ResponseEntity<Product> toggleProductStatus(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Product toggled = productService.toggleProductStatus(id, userDetails.getUser());
        broadcastProductUpdate();
        return ResponseEntity.ok(toggled);
    }

    @PostMapping("/seller/upload")
    public ResponseEntity<?> uploadProductImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }
        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path targetPath = uploadDir.resolve(newFileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + newFileName;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Could not upload file: " + e.getMessage()));
        }
    }
}
