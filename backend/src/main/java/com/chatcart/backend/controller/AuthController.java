package com.chatcart.backend.controller;

import com.chatcart.backend.model.Brand;
import com.chatcart.backend.repository.BrandRepository;
import com.chatcart.backend.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final BrandRepository brandRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(BrandRepository brandRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.brandRepository = brandRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (brandRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email already in use"));
        }

        Brand brand = new Brand();
        brand.setStoreName(request.getStoreName());
        brand.setEmail(request.getEmail());
        brand.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        brand.setWhatsappNumber(request.getWhatsappNumber());
        brand.setWebhookToken(UUID.randomUUID().toString().substring(0, 18));
        brand.setDiscountPercent(10); // default 10%
        brand.setLogoUrl(request.getLogoUrl() != null && !request.getLogoUrl().isBlank() ? 
            request.getLogoUrl() : "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150");

        Brand savedBrand = brandRepository.save(brand);
        String token = jwtUtils.generateToken(savedBrand.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("brand", savedBrand);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Brand> brandOpt = brandRepository.findByEmail(request.getEmail());
        if (brandOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), brandOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        Brand brand = brandOpt.get();
        String token = jwtUtils.generateToken(brand.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("brand", brand);
        return ResponseEntity.ok(response);
    }

    // Helper requests DTOs
    @lombok.Data
    public static class RegisterRequest {
        private String storeName;
        private String email;
        private String password;
        private String whatsappNumber;
        private String logoUrl;
    }

    @lombok.Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
