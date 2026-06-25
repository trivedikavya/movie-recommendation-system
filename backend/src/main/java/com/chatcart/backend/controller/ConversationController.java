package com.chatcart.backend.controller;

import com.chatcart.backend.model.BotSession;
import com.chatcart.backend.model.Brand;
import com.chatcart.backend.model.Message;
import com.chatcart.backend.repository.BotSessionRepository;
import com.chatcart.backend.repository.BrandRepository;
import com.chatcart.backend.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "*")
@Slf4j
public class ConversationController {

    private final BotSessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final BrandRepository brandRepository;

    public ConversationController(
            BotSessionRepository sessionRepository,
            MessageRepository messageRepository,
            BrandRepository brandRepository) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.brandRepository = brandRepository;
    }

    private Brand getAuthenticatedBrand() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return brandRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated brand not found"));
    }

    /**
     * Get all active/completed WhatsApp threads for the brand
     */
    @GetMapping
    public ResponseEntity<List<BotSession>> getConversations() {
        Brand brand = getAuthenticatedBrand();
        List<BotSession> sessions = sessionRepository.findByBrandIdOrderByLastMessageAtDesc(brand.getId());
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get chat message history (transcript) for a specific phone number
     */
    @GetMapping("/{phone}")
    public ResponseEntity<?> getChatHistory(@PathVariable("phone") String phone) {
        Brand brand = getAuthenticatedBrand();
        
        List<Message> history = messageRepository.findByPhoneAndBrandIdOrderByCreatedAtAsc(phone, brand.getId());
        return ResponseEntity.ok(history);
    }
}
