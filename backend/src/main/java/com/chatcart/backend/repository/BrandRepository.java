package com.chatcart.backend.repository;

import com.chatcart.backend.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
    Optional<Brand> findByEmail(String email);
    Optional<Brand> findByWebhookToken(String webhookToken);
}
