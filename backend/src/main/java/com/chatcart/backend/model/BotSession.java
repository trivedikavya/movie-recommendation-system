package com.chatcart.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bot_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BotSession {
    @Id
    @Column(length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(name = "current_step", nullable = false)
    private String currentStep; // GREETING_PRODUCT, CAPTURE_DETAILS_NAME, CAPTURE_DETAILS_PHONE, CAPTURE_DETAILS_ADDRESS, PAYMENT_SELECTION, HESITATION_BUDGET, FILTER_CATEGORY, FILTER_COLOUR, SHOW_CATALOGUE, SMART_NUDGE

    @Column(name = "budget")
    private Integer budget;

    @Column(name = "category")
    private String category;

    @Column(name = "colour")
    private String colour;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt = LocalDateTime.now();

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, DROPPED
}
