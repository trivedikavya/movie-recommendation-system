package com.chatcart.backend.repository;

import com.chatcart.backend.model.BotSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BotSessionRepository extends JpaRepository<BotSession, String> {
    List<BotSession> findByBrandIdOrderByLastMessageAtDesc(Integer brandId);
}
