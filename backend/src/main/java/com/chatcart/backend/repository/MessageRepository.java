package com.chatcart.backend.repository;

import com.chatcart.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByPhoneOrderByCreatedAtAsc(String phone);
    List<Message> findByPhoneAndBrandIdOrderByCreatedAtAsc(String phone, Integer brandId);
    void deleteByPhone(String phone);
}
