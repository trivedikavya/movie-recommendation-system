package com.chatcart.backend.service;

import com.chatcart.backend.model.Brand;
import com.chatcart.backend.model.Message;
import com.chatcart.backend.repository.MessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class MetaMessagingService {

    private final MessageRepository messageRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${whatsapp.meta.phone-number-id}")
    private String defaultPhoneId;

    public MetaMessagingService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Sends a plain text message to a user.
     */
    public void sendTextMessage(String phone, String text, Brand brand) {
        log.info("Sending text to {}: {}", phone, text);
        saveMessage(phone, "BOT", "TEXT", text, brand);

        if (isMockMode(brand)) {
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("messaging_product", "whatsapp");
        payload.put("to", phone);
        payload.put("type", "text");
        payload.put("text", Map.of("body", text));

        sendToMetaAPI(payload, brand);
    }

    /**
     * Sends quick reply buttons (up to 3 in standard WhatsApp API).
     */
    public void sendButtonsMessage(String phone, String headerText, List<String> buttonTitles, Brand brand) {
        log.info("Sending buttons to {}: Header='{}', Buttons={}", phone, headerText, buttonTitles);

        // Save structured format as JSON content to let simulator/dashboard parse it nicely
        Map<String, Object> contentMap = new HashMap<>();
        contentMap.addValue("text", headerText);
        contentMap.addValue("buttons", buttonTitles);
        try {
            String jsonContent = objectMapper.writeValueAsString(contentMap);
            saveMessage(phone, "BOT", "INTERACTIVE", jsonContent, brand);
        } catch (Exception e) {
            saveMessage(phone, "BOT", "TEXT", headerText + " [Buttons: " + String.join(", ", buttonTitles) + "]", brand);
        }

        if (isMockMode(brand)) {
            return;
        }

        // Standard WhatsApp API payload construction for Interactive Buttons
        List<Map<String, Object>> buttons = new java.util.ArrayList<>();
        for (int i = 0; i < Math.min(buttonTitles.size(), 3); i++) {
            String title = buttonTitles.get(i);
            buttons.add(Map.of(
                "type", "reply",
                "reply", Map.of(
                    "id", "btn_" + i,
                    "title", title.length() > 20 ? title.substring(0, 17) + "..." : title
                )
            ));
        }

        Map<String, Object> interactive = Map.of(
            "type", "button",
            "body", Map.of("text", headerText),
            "action", Map.of("buttons", buttons)
        );

        Map<String, Object> payload = Map.of(
            "messaging_product", "whatsapp",
            "to", phone,
            "type", "interactive",
            "interactive", interactive
        );

        sendToMetaAPI(payload, brand);
    }

    /**
     * Sends an interactive list message.
     */
    public void sendListMessage(String phone, String bodyText, String buttonText, String listTitle, List<String> items, Brand brand) {
        log.info("Sending list to {}: Body='{}', Items={}", phone, bodyText, items);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.addValue("text", bodyText);
        contentMap.addValue("buttonText", buttonText);
        contentMap.addValue("listTitle", listTitle);
        contentMap.addValue("items", items);
        try {
            String jsonContent = objectMapper.writeValueAsString(contentMap);
            saveMessage(phone, "BOT", "LIST", jsonContent, brand);
        } catch (Exception e) {
            saveMessage(phone, "BOT", "TEXT", bodyText + " [List: " + String.join(", ", items) + "]", brand);
        }

        if (isMockMode(brand)) {
            return;
        }

        List<Map<String, Object>> rows = new java.util.ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            rows.add(Map.of(
                "id", "list_row_" + i,
                "title", items.get(i).length() > 24 ? items.get(i).substring(0, 21) + "..." : items.get(i)
            ));
        }

        Map<String, Object> interactive = Map.of(
            "type", "list",
            "body", Map.of("text", bodyText),
            "action", Map.of(
                "button", buttonText,
                "sections", List.of(Map.of(
                    "title", listTitle,
                    "rows", rows
                ))
            )
        );

        Map<String, Object> payload = Map.of(
            "messaging_product", "whatsapp",
            "to", phone,
            "type", "interactive",
            "interactive", interactive
        );

        sendToMetaAPI(payload, brand);
    }

    /**
     * Sends product cards (simulates product search cards/templates).
     */
    public void sendProductCard(String phone, Map<String, Object> productDetails, List<String> buttonTitles, Brand brand) {
        log.info("Sending product card to {}: Product={}, Buttons={}", phone, productDetails.get("name"), buttonTitles);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.addValue("product", productDetails);
        contentMap.addValue("buttons", buttonTitles);
        try {
            String jsonContent = objectMapper.writeValueAsString(contentMap);
            saveMessage(phone, "BOT", "PRODUCT", jsonContent, brand);
        } catch (Exception e) {
            saveMessage(phone, "BOT", "TEXT", "Product: " + productDetails.get("name") + " - ₹" + productDetails.get("price"), brand);
        }

        if (isMockMode(brand)) {
            return;
        }

        // A fallback text message + image message for standard Meta Cloud API (since Catalog items are normally handled in Meta Commerce Manager)
        String imageUrl = (String) productDetails.get("imageUrl");
        if (imageUrl != null && !imageUrl.isBlank()) {
            Map<String, Object> mediaPayload = Map.of(
                "messaging_product", "whatsapp",
                "to", phone,
                "type", "image",
                "image", Map.of("link", imageUrl, "caption", productDetails.get("name") + "\nPrice: ₹" + productDetails.get("price"))
            );
            sendToMetaAPI(mediaPayload, brand);
        }

        String productText = String.format("🛍️ *%s*\n💵 Price: ₹%s\n🏷️ Category: %s\n🎨 Colours: %s",
                productDetails.get("name"),
                productDetails.get("price"),
                productDetails.get("category"),
                productDetails.get("colours")
        );
        sendButtonsMessage(phone, productText, buttonTitles, brand);
    }

    /**
     * Sends multiple product items (for STEP 6 catalogue display).
     */
    public void sendMultiProductMessage(String phone, String bodyText, List<Map<String, Object>> products, boolean hasMore, Brand brand) {
        log.info("Sending multi-product grid to {}: Products count={}, hasMore={}", phone, products.size(), hasMore);

        Map<String, Object> contentMap = new HashMap<>();
        contentMap.addValue("text", bodyText);
        contentMap.addValue("products", products);
        contentMap.addValue("hasMore", hasMore);
        try {
            String jsonContent = objectMapper.writeValueAsString(contentMap);
            saveMessage(phone, "BOT", "CATALOGUE", jsonContent, brand);
        } catch (Exception e) {
            saveMessage(phone, "BOT", "TEXT", bodyText + " (catalogue results)", brand);
        }

        if (isMockMode(brand)) {
            return;
        }

        // For real Meta WhatsApp, we can send a general list message with product titles,
        // or a series of text cards.
        sendTextMessage(phone, bodyText, brand);
        for (Map<String, Object> prod : products) {
            sendProductCard(phone, prod, List.of("Buy " + prod.get("name")), brand);
        }
    }

    private void saveMessage(String phone, String sender, String messageType, String content, Brand brand) {
        Message msg = new Message();
        msg.setPhone(phone);
        msg.setSender(sender);
        msg.setMessageType(messageType);
        msg.setContent(content);
        msg.setBrand(brand);
        messageRepository.save(msg);
    }

    private boolean isMockMode(Brand brand) {
        return brand.getMetaAccessToken() == null 
                || "mock".equalsIgnoreCase(brand.getMetaAccessToken())
                || brand.getMetaAccessToken().isBlank();
    }

    private void sendToMetaAPI(Map<String, Object> payload, Brand brand) {
        String token = brand.getMetaAccessToken();
        String phoneId = brand.getWhatsappNumber() != null ? brand.getWhatsappNumber() : defaultPhoneId;
        String url = "https://graph.facebook.com/v19.0/" + phoneId + "/messages";

        try {
            String requestBody = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + token)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> {
                        if (res.statusCode() >= 400) {
                            log.error("Meta Graph API returned error code {}: {}", res.statusCode(), res.body());
                        } else {
                            log.debug("Successfully pushed message to Meta API: {}", res.body());
                        }
                    });
        } catch (Exception e) {
            log.error("Error formatting or sending message to Meta API", e);
        }
    }
}
