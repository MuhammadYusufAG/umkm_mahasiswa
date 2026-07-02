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

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

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
        return ResponseEntity.ok(productService.addProduct(product, userDetails.getUser()));
    }

    @PutMapping("/seller/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(productService.updateProduct(id, product, userDetails.getUser()));
    }

    @DeleteMapping("/seller/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        productService.deleteProduct(id, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/seller/{id}/toggle-status")
    public ResponseEntity<Product> toggleProductStatus(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(productService.toggleProductStatus(id, userDetails.getUser()));
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
