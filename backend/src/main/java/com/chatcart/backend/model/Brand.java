package com.chatcart.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "meta_access_token")
    private String metaAccessToken;

    @Column(name = "webhook_token", nullable = false)
    private String webhookToken;

    @Column(name = "discount_percent")
    private Integer discountPercent = 5;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
