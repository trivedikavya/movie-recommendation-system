package com.chatcart.backend.controller;

import com.chatcart.backend.model.Brand;
import com.chatcart.backend.model.Message;
import com.chatcart.backend.repository.BrandRepository;
import com.chatcart.backend.repository.MessageRepository;
import com.chatcart.backend.service.BotFlowService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/webhook/whatsapp")
@Slf4j
public class WebhookController {

    private final BotFlowService botFlowService;
    private final BrandRepository brandRepository;
    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    @Value("${whatsapp.meta.webhook-verify-token}")
    private String globalVerifyToken;

    public WebhookController(
            BotFlowService botFlowService,
            BrandRepository brandRepository,
            MessageRepository messageRepository) {
        this.botFlowService = botFlowService;
        this.brandRepository = brandRepository;
        this.messageRepository = messageRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Meta Webhook Verification (GET /webhook/whatsapp)
     */
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {
        
        log.info("Verifying Meta webhook: mode={}, token={}", mode, token);
        if ("subscribe".equals(mode) && globalVerifyToken.equals(token)) {
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed");
    }

    /**
     * Webhook Verification by brandId (GET /webhook/whatsapp/{brandId})
     */
    @GetMapping("/{brandId}")
    public ResponseEntity<String> verifyWebhookForBrand(
            @PathVariable("brandId") Integer brandId,
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        log.info("Verifying webhook for brandId={}: token={}", brandId, token);
        Optional<Brand> brand = brandRepository.findById(brandId);
        if (brand.isPresent() && brand.get().getWebhookToken().equals(token)) {
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed");
    }

    /**
     * Incoming Meta Webhook Event (POST /webhook/whatsapp)
     */
    @PostMapping
    public ResponseEntity<Void> handleIncomingMessage(@RequestBody String requestBody) {
        log.debug("Received webhook payload: {}", requestBody);
        try {
            JsonNode root = objectMapper.readTree(requestBody);
            JsonNode entry = root.path("entry").get(0);
            if (entry != null) {
                JsonNode change = entry.path("changes").get(0);
                if (change != null) {
                    JsonNode value = change.path("value");
                    JsonNode messages = value.path("messages");
                    if (messages.isArray() && messages.size() > 0) {
                        JsonNode message = messages.get(0);
                        String phone = message.path("from").asText();
                        String type = message.path("type").asText();
                        String text = "";

                        if ("text".equals(type)) {
                            text = message.path("text").path("body").asText();
                        } else if ("interactive".equals(type)) {
                            JsonNode interactive = message.path("interactive");
                            String interType = interactive.path("type").asText();
                            if ("button_reply".equals(interType)) {
                                text = interactive.path("button_reply").path("title").asText();
                            } else if ("list_reply".equals(interType)) {
                                text = interactive.path("list_reply").path("title").asText();
                            }
                        }

                        if (!phone.isBlank() && !text.isBlank()) {
                            // Find Brand. Standard fallback is brand ID 1 for global webhook, 
                            // or lookup by Meta Phone ID
                            String phoneId = value.path("metadata").path("phone_number_id").asText();
                            
                            // Find by phone number in DB or use default brand (ID 1)
                            Brand brand = brandRepository.findAll().stream()
                                    .filter(b -> phoneId.equals(b.getWhatsappNumber()))
                                    .findFirst()
                                    .orElse(brandRepository.findById(1).orElse(null));

                            if (brand != null) {
                                // Save incoming user message
                                Message userMsg = new Message();
                                userMsg.setPhone(phone);
                                userMsg.setSender("USER");
                                userMsg.setMessageType("TEXT");
                                userMsg.setContent(text);
                                userMsg.setBrand(brand);
                                messageRepository.save(userMsg);

                                botFlowService.processInput(phone, text, brand.getId());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Meta webhook payload", e);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Incoming Webhook Event by brandId (POST /webhook/whatsapp/{brandId})
     */
    @PostMapping("/{brandId}")
    public ResponseEntity<Void> handleIncomingMessageForBrand(
            @PathVariable("brandId") Integer brandId,
            @RequestBody String requestBody) {
        
        log.debug("Received webhook payload for brandId={}", brandId);
        try {
            JsonNode root = objectMapper.readTree(requestBody);
            JsonNode entry = root.path("entry").get(0);
            if (entry != null) {
                JsonNode change = entry.path("changes").get(0);
                if (change != null) {
                    JsonNode value = change.path("value");
                    JsonNode messages = value.path("messages");
                    if (messages.isArray() && messages.size() > 0) {
                        JsonNode message = messages.get(0);
                        String phone = message.path("from").asText();
                        String type = message.path("type").asText();
                        String text = "";

                        if ("text".equals(type)) {
                            text = message.path("text").path("body").asText();
                        } else if ("interactive".equals(type)) {
                            JsonNode interactive = message.path("interactive");
                            String interType = interactive.path("type").asText();
                            if ("button_reply".equals(interType)) {
                                text = interactive.path("button_reply").path("title").asText();
                            } else if ("list_reply".equals(interType)) {
                                text = interactive.path("list_reply").path("title").asText();
                            }
                        }

                        if (!phone.isBlank() && !text.isBlank() && brandRepository.existsById(brandId)) {
                            Brand brand = brandRepository.findById(brandId).get();
                            
                            // Save user message
                            Message userMsg = new Message();
                            userMsg.setPhone(phone);
                            userMsg.setSender("USER");
                            userMsg.setMessageType("TEXT");
                            userMsg.setContent(text);
                            userMsg.setBrand(brand);
                            messageRepository.save(userMsg);

                            botFlowService.processInput(phone, text, brandId);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Meta webhook payload for brand: " + brandId, e);
        }
        return ResponseEntity.ok().build();
    }
}
