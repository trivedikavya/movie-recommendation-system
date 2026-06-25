package com.chatcart.backend.controller;

import com.chatcart.backend.model.Brand;
import com.chatcart.backend.model.Product;
import com.chatcart.backend.repository.BrandRepository;
import com.chatcart.backend.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Slf4j
public class ProductController {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;

    @Value("${aws.s3.bucket:mock-bucket}")
    private String s3Bucket;

    public ProductController(ProductRepository productRepository, BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
    }

    private Brand getAuthenticatedBrand() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return brandRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated brand not found"));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getProducts() {
        Brand brand = getAuthenticatedBrand();
        List<Product> products = productRepository.findByBrandId(brand.getId());
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestParam("name") String name,
            @RequestParam("price") BigDecimal price,
            @RequestParam("category") String category,
            @RequestParam("colours") String colours,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {
        
        Brand brand = getAuthenticatedBrand();
        Product product = new Product();
        product.setBrand(brand);
        product.setName(name);
        product.setPrice(price);
        product.setCategory(category);
        product.setColours(colours);
        product.setInStock(true);

        String finalImageUrl = imageUrl;

        // Simulate S3 upload or handle local static upload
        if (image != null && !image.isEmpty()) {
            try {
                // Try simulating S3 upload
                log.info("Simulating AWS S3 upload to bucket: {}", s3Bucket);
                
                // Write locally to make it accessible to frontend
                String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                String uploadDir = "uploads";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                Path filePath = uploadPath.resolve(filename);
                Files.copy(image.getInputStream(), filePath);
                
                // Return localhost mock url (the backend main class can serve this directory)
                finalImageUrl = "http://localhost:8080/uploads/" + filename;
            } catch (IOException e) {
                log.error("Failed to store image", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to upload image: " + e.getMessage()));
            }
        }

        if (finalImageUrl == null || finalImageUrl.isBlank()) {
            // Default placeholder
            finalImageUrl = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500";
        }

        product.setImageUrl(finalImageUrl);
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable("id") Integer id,
            @RequestBody Product productData) {
        
        Brand brand = getAuthenticatedBrand();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getBrand().getId().equals(brand.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        product.setName(productData.getName());
        product.setPrice(productData.getPrice());
        product.setCategory(productData.getCategory());
        product.setColours(productData.getColours());
        if (productData.getImageUrl() != null) {
            product.setImageUrl(productData.getImageUrl());
        }
        if (productData.getInStock() != null) {
            product.setInStock(productData.getInStock());
        }

        Product updated = productRepository.save(product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Integer id) {
        Brand brand = getAuthenticatedBrand();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getBrand().getId().equals(brand.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        productRepository.delete(product);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}
