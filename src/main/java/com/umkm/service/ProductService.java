package com.umkm.service;

import com.umkm.entity.Product;
import com.umkm.entity.User;
import com.umkm.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public Product addProduct(Product product, User seller) {
        product.setSeller(seller);
        product.setIsActive(true);
        return productRepository.save(product);
    }

    public Product updateProduct(Long productId, Product updatedProduct, User seller) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Unauthorized: You can only edit your own products");
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        if (updatedProduct.getIsActive() != null) {
            existingProduct.setIsActive(updatedProduct.getIsActive());
        }
        
        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long productId, User seller) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own products");
        }
        
        productRepository.delete(existingProduct);
    }
    
    public Product toggleProductStatus(Long productId, User seller) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Unauthorized: You can only edit your own products");
        }
        
        existingProduct.setIsActive(!existingProduct.getIsActive());
        return productRepository.save(existingProduct);
    }
}
