package com.chatcart.backend.service;

import com.chatcart.backend.model.Order;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class RazorpayService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public RazorpayService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String createPaymentLink(Order order) {
        log.info("Generating Razorpay link for order {}: Amount ₹{}", order.getId(), order.getAmount());

        if (isMockMode()) {
            // Return simulation payment page URL hosted on the backend
            return "http://localhost:8080/api/simulation/payment?orderId=" + order.getId() + "&amount=" + order.getAmount();
        }

        try {
            // Standard Razorpay payment link endpoint
            String url = "https://api.razorpay.com/v1/payment_links";
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("amount", order.getAmount().multiply(new java.math.BigDecimal(100)).intValue()); // in paise
            payload.put("currency", "INR");
            payload.put("accept_partial", false);
            payload.put("reference_id", "order_ref_" + order.getId());
            payload.put("description", "Payment for " + order.getProductName() + " on ChatCart");

            Map<String, String> customer = new HashMap<>();
            customer.put("name", order.getCustomerName() != null ? order.getCustomerName() : "ChatCart Customer");
            customer.put("contact", order.getPhone());
            payload.put("customer", customer);

            // Notify customer is handled by bot, so we disable Razorpay's auto SMS/Email notifications
            payload.put("notify", Map.of("sms", false, "email", false));
            payload.put("callback_url", "http://localhost:8080/api/simulation/payment-callback");
            payload.put("callback_method", "get");

            String jsonPayload = objectMapper.writeValueAsString(payload);
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("Authorization", authHeader)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                Map<?, ?> responseMap = objectMapper.readValue(response.body(), Map.class);
                return (String) responseMap.get("short_url");
            } else {
                log.error("Razorpay API returned code {}: {}", response.statusCode(), response.body());
                // Fallback to simulator
                return "http://localhost:8080/api/simulation/payment?orderId=" + order.getId() + "&amount=" + order.getAmount();
            }

        } catch (Exception e) {
            log.error("Failed to connect to Razorpay, falling back to simulation link", e);
            return "http://localhost:8080/api/simulation/payment?orderId=" + order.getId() + "&amount=" + order.getAmount();
        }
    }

    private boolean isMockMode() {
        return razorpayKeyId == null 
                || "rzp_test_mock_id".equalsIgnoreCase(razorpayKeyId) 
                || razorpayKeyId.isBlank();
    }
}
