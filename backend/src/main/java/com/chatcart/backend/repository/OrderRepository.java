package com.chatcart.backend.repository;

import com.chatcart.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByBrandIdOrderByCreatedAtDesc(Integer brandId);

    @Query("SELECT o FROM Order o WHERE o.brand.id = :brandId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod) " +
           "ORDER BY o.createdAt DESC")
    List<Order> findFilteredOrders(
        @Param("brandId") Integer brandId,
        @Param("status") String status,
        @Param("paymentMethod") String paymentMethod
    );
}
