package com.chatcart.backend.repository;

import com.chatcart.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByBrandId(Integer brandId);

    @Query("SELECT p FROM Product p WHERE p.brand.id = :brandId " +
           "AND (:category IS NULL OR LOWER(p.category) = LOWER(:category)) " +
           "AND (:colour IS NULL OR LOWER(p.colours) LIKE LOWER(CONCAT('%', :colour, '%')) OR LOWER(:colour) = 'any colour' OR LOWER(:colour) = 'any') " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND p.inStock = true")
    List<Product> findFilteredProducts(
        @Param("brandId") Integer brandId,
        @Param("category") String category,
        @Param("colour") String colour,
        @Param("maxPrice") BigDecimal maxPrice
    );
}
