package com.chatcart.backend.controller;

import com.chatcart.backend.model.*;
import com.chatcart.backend.repository.*;
import com.chatcart.backend.service.BotFlowService;
import com.chatcart.backend.service.MetaMessagingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/simulation")
@CrossOrigin(origins = "*")
@Slf4j
public class SimulationController {

    private final BotFlowService botFlowService;
    private final MessageRepository messageRepository;
    private final BotSessionRepository sessionRepository;
    private final OrderRepository orderRepository;
    private final BrandRepository brandRepository;
    private final MetaMessagingService messagingService;

    public SimulationController(
            BotFlowService botFlowService,
            MessageRepository messageRepository,
            BotSessionRepository sessionRepository,
            OrderRepository orderRepository,
            BrandRepository brandRepository,
            MetaMessagingService messagingService) {
        this.botFlowService = botFlowService;
        this.messageRepository = messageRepository;
        this.sessionRepository = sessionRepository;
        this.orderRepository = orderRepository;
        this.brandRepository = brandRepository;
        this.messagingService = messagingService;
    }

    /**
     * Post a user message to simulate WhatsApp webhook receipt
     */
    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<Void> simulateUserMessage(@RequestBody SimulationRequest request) {
        log.info("Simulating incoming message from {}: '{}' (brandId: {})", 
                request.getPhone(), request.getText(), request.getBrandId());

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        // Save incoming user message
        Message userMsg = new Message();
        userMsg.setPhone(request.getPhone());
        userMsg.setSender("USER");
        userMsg.setMessageType("TEXT");
        userMsg.setContent(request.getText());
        userMsg.setBrand(brand);
        messageRepository.save(userMsg);

        // Process message through bot state machine
        botFlowService.processInput(request.getPhone(), request.getText(), request.getBrandId());

        return ResponseEntity.ok().build();
    }

    /**
     * Get all chat history for simulator polling
     */
    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getMessageHistory(@RequestParam("phone") String phone) {
        List<Message> history = messageRepository.findByPhoneOrderByCreatedAtAsc(phone);
        return ResponseEntity.ok(history);
    }

    /**
     * Reset WhatsApp bot session and clear message log
     */
    @PostMapping("/reset")
    @Transactional
    public ResponseEntity<Map<String, String>> resetSession(@RequestParam("phone") String phone, @RequestParam("brandId") Integer brandId) {
        log.info("Resetting session and chat logs for {}", phone);
        sessionRepository.deleteById(phone);
        messageRepository.deleteByPhone(phone);
        return ResponseEntity.ok(Map.of("message", "Session and history cleared"));
    }

    /**
     * Razorpay checkout simulator page (GET /api/simulation/payment)
     */
    @GetMapping(value = "/payment", produces = MediaType.TEXT_HTML_VALUE)
    public String renderPaymentPage(@RequestParam("orderId") Integer orderId, @RequestParam("amount") String amount) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return "<html><body><h2>Order not found</h2></body></html>";
        }
        Order order = orderOpt.get();

        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <title>Razorpay Secure Checkout Simulator</title>\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <script src=\"https://cdn.tailwindcss.com\"></script>\n" +
                "    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n" +
                "    <style>body { font-family: 'Inter', sans-serif; }</style>\n" +
                "</head>\n" +
                "<body class=\"bg-slate-50 flex items-center justify-center min-h-screen p-4\">\n" +
                "    <div class=\"bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden\">\n" +
                "        <!-- Razorpay Header -->\n" +
                "        <div class=\"bg-blue-600 p-6 text-white flex justify-between items-center\">\n" +
                "            <div>\n" +
                "                <h1 class=\"text-lg font-bold tracking-tight\">Razorpay Checkout</h1>\n" +
                "                <p class=\"text-xs text-blue-100\">Secure UPI & Cards</p>\n" +
                "            </div>\n" +
                "            <div class=\"text-right\">\n" +
                "                <div class=\"text-xs text-blue-200\">Amount Payble</div>\n" +
                "                <div class=\"text-xl font-extrabold\">₹" + amount + "</div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        \n" +
                "        <!-- Order Details -->\n" +
                "        <div class=\"p-6 border-b border-slate-100 bg-slate-50/50\">\n" +
                "            <div class=\"text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2\">Order Summary</div>\n" +
                "            <div class=\"flex justify-between items-center\">\n" +
                "                <span class=\"font-medium text-slate-700\">" + order.getProductName() + "</span>\n" +
                "                <span class=\"text-slate-500\">Order #" + orderId + "</span>\n" +
                "            </div>\n" +
                "            <div class=\"text-sm text-slate-500 mt-1\">Customer: " + order.getCustomerName() + " | Phone: " + order.getPhone() + "</div>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- Payment Options Mockup -->\n" +
                "        <div class=\"p-6 space-y-4\">\n" +
                "            <div class=\"text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1\">Select Payment Option</div>\n" +
                "            \n" +
                "            <!-- UPI -->\n" +
                "            <div class=\"flex items-center justify-between p-3 border border-blue-500 bg-blue-50/30 rounded-xl cursor-pointer\">\n" +
                "                <div class=\"flex items-center space-x-3\">\n" +
                "                    <div class=\"w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold\">✓</div>\n" +
                "                    <div>\n" +
                "                        <div class=\"font-semibold text-slate-800 text-sm\">Pay via UPI / GooglePay</div>\n" +
                "                        <div class=\"text-xs text-slate-500\">GPay, PhonePe, Paytm, BHIM</div>\n" +
                "                    </div>\n" +
                "                </div>\n" +
                "                <span class=\"text-xs font-medium text-blue-600\">Popular</span>\n" +
                "            </div>\n" +
                "            \n" +
                "            <!-- Card Mock -->\n" +
                "            <div class=\"flex items-center space-x-3 p-3 border border-slate-200 rounded-xl opacity-60\">\n" +
                "                <div class=\"w-5 h-5 rounded-full border border-slate-300\"></div>\n" +
                "                <div>\n" +
                "                    <div class=\"font-semibold text-slate-800 text-sm\">Credit / Debit Card</div>\n" +
                "                    <div class=\"text-xs text-slate-500\">Visa, Mastercard, RuPay</div>\n" +
                "                </div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "        \n" +
                "        <!-- Call to Action -->\n" +
                "        <div class=\"p-6 bg-slate-50 border-t border-slate-100 flex flex-col items-center\">\n" +
                "            <a href=\"/api/simulation/payment-callback?orderId=" + orderId + "\" \n" +
                "               class=\"w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-center shadow-lg shadow-blue-500/20 transition-all duration-150 block\">\n" +
                "                Simulate Successful Payment\n" +
                "            </a>\n" +
                "            <p class=\"text-[11px] text-slate-400 mt-3 text-center\">This is a local environment simulator representing the Razorpay Checkout API. Clicking above will fire a webhook success response to ChatCart.</p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    /**
     * Razorpay callback simulation endpoint (GET /api/simulation/payment-callback)
     */
    @GetMapping(value = "/payment-callback", produces = MediaType.TEXT_HTML_VALUE)
    @Transactional
    public String handlePaymentCallback(@RequestParam("orderId") Integer orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return "<html><body><h2>Order not found</h2></body></html>";
        }
        Order order = orderOpt.get();

        // 1. Mark order status as CONFIRMED, paymentId as simulated
        order.setStatus("CONFIRMED");
        order.setRazorpayPaymentId("pay_simulated_" + System.currentTimeMillis());
        orderRepository.save(order);

        // 2. Trigger Bot Session update to COMPLETED (the transaction finished)
        Optional<BotSession> sessionOpt = sessionRepository.findById(order.getPhone());
        if (sessionOpt.isPresent()) {
            BotSession session = sessionOpt.get();
            session.setStatus("COMPLETED");
            sessionRepository.save(session);
        }

        // 3. Send confirmation WhatsApp message via Bot flow
        String successText = String.format("✅ *Payment Successful!* Thank you, %s.\n\nYour payment of *₹%,.0f* has been processed. Your order for *%s* is now *CONFIRMED*! 🎉\n\nWe will share the tracking link once shipped. Have a great day!",
                order.getCustomerName(), order.getAmount(), order.getProductName());
        messagingService.sendTextMessage(order.getPhone(), successText, order.getBrand());

        // 4. Return nice success page
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <title>Payment Successful</title>\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <script src=\"https://cdn.tailwindcss.com\"></script>\n" +
                "    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n" +
                "    <style>body { font-family: 'Inter', sans-serif; }</style>\n" +
                "</head>\n" +
                "<body class=\"bg-slate-50 flex items-center justify-center min-h-screen p-4\">\n" +
                "    <div class=\"bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-8 text-center\">\n" +
                "        <!-- Success Checkmark Animation -->\n" +
                "        <div class=\"mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6\">\n" +
                "            <svg class=\"h-10 w-10 text-emerald-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n" +
                "                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3\" d=\"M5 13l4 4L19 7\"></path>\n" +
                "            </svg>\n" +
                "        </div>\n" +
                "        \n" +
                "        <h1 class=\"text-2xl font-bold text-slate-800 mb-2\">Payment Success!</h1>\n" +
                "        <p class=\"text-sm text-slate-500 mb-6\">Order #" + orderId + " has been successfully confirmed. A WhatsApp confirmation has been dispatched to your phone.</p>\n" +
                "        \n" +
                "        <div class=\"bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm text-slate-600\">\n" +
                "            <div class=\"flex justify-between\"><span class=\"font-medium\">Product:</span> <span>" + order.getProductName() + "</span></div>\n" +
                "            <div class=\"flex justify-between\"><span class=\"font-medium\">Paid Amount:</span> <span class=\"font-semibold text-emerald-600\">₹" + order.getAmount() + "</span></div>\n" +
                "            <div class=\"flex justify-between\"><span class=\"font-medium\">Payment ID:</span> <span class=\"font-mono text-xs\">" + order.getRazorpayPaymentId() + "</span></div>\n" +
                "        </div>\n" +
                "        \n" +
                "        <button onclick=\"window.close()\" class=\"w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-150\">\n" +
                "            Close Window\n" +
                "        </button>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    // Helper request DTO
    @lombok.Data
    public static class SimulationRequest {
        private String phone;
        private String text;
        private Integer brandId;
    }
}
