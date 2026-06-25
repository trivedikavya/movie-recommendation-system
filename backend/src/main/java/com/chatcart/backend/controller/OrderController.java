package com.chatcart.backend.controller;

import com.chatcart.backend.model.Brand;
import com.chatcart.backend.model.Order;
import com.chatcart.backend.repository.BrandRepository;
import com.chatcart.backend.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@Slf4j
public class OrderController {

    private final OrderRepository orderRepository;
    private final BrandRepository brandRepository;

    public OrderController(OrderRepository orderRepository, BrandRepository brandRepository) {
        this.orderRepository = orderRepository;
        this.brandRepository = brandRepository;
    }

    private Brand getAuthenticatedBrand() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return brandRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated brand not found"));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "paymentMethod", required = false) String paymentMethod) {
        
        Brand brand = getAuthenticatedBrand();
        
        // Clean params
        String filterStatus = (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) ? null : status;
        String filterPay = (paymentMethod == null || paymentMethod.isBlank() || "ALL".equalsIgnoreCase(paymentMethod)) ? null : paymentMethod;

        List<Order> orders = orderRepository.findFilteredOrders(brand.getId(), filterStatus, filterPay);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") Integer id) {
        Brand brand = getAuthenticatedBrand();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBrand().getId().equals(brand.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable("id") Integer id,
            @RequestBody Map<String, String> body) {
        
        Brand brand = getAuthenticatedBrand();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBrand().getId().equals(brand.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }

        order.setStatus(newStatus.toUpperCase());
        Order updated = orderRepository.save(order);
        return ResponseEntity.ok(updated);
    }
}
