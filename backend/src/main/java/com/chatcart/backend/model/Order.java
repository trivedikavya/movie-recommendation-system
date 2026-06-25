package com.chatcart.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(name = "customer_name")
    private String customerName;

    @Column(nullable = false)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "discount_applied")
    private BigDecimal discountApplied = BigDecimal.ZERO;

    @Column(name = "payment_method")
    private String paymentMethod; // COD, UPI, BNPL

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_payment_link")
    private String razorpayPaymentLink;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
