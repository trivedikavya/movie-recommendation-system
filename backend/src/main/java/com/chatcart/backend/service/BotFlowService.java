package com.chatcart.backend.service;

import com.chatcart.backend.model.*;
import com.chatcart.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class BotFlowService {

    private final BotSessionRepository sessionRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final BrandRepository brandRepository;
    private final MetaMessagingService messagingService;
    private final RazorpayService razorpayService;

    public BotFlowService(
            BotSessionRepository sessionRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            BrandRepository brandRepository,
            MetaMessagingService messagingService,
            RazorpayService razorpayService) {
        this.sessionRepository = sessionRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.brandRepository = brandRepository;
        this.messagingService = messagingService;
        this.razorpayService = razorpayService;
    }

    @Transactional
    public void processInput(String phone, String rawInput, Integer brandId) {
        String input = rawInput.trim();
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found: " + brandId));

        // Global commands
        if ("reset".equalsIgnoreCase(input) || "clear".equalsIgnoreCase(input)) {
            sessionRepository.deleteById(phone);
            startFlow(phone, brand);
            return;
        }

        BotSession session = sessionRepository.findById(phone).orElse(null);

        if (session == null || "COMPLETED".equals(session.getStatus()) || "DROPPED".equals(session.getStatus())) {
            startFlow(phone, brand);
            return;
        }

        // Process step state
        String step = session.getCurrentStep();
        session.setLastMessageAt(LocalDateTime.now());

        try {
            switch (step) {
                case "GREETING_PRODUCT":
                    handleGreetingProduct(session, input, brand);
                    break;
                case "CAPTURE_DETAILS_NAME":
                    handleCaptureDetailsName(session, input, brand);
                    break;
                case "CAPTURE_DETAILS_ADDRESS":
                    handleCaptureDetailsAddress(session, input, brand);
                    break;
                case "PAYMENT_SELECTION":
                    handlePaymentSelection(session, input, brand);
                    break;
                case "HESITATION_BUDGET":
                    handleHesitationBudget(session, input, brand);
                    break;
                case "FILTER_CATEGORY":
                    handleFilterCategory(session, input, brand);
                    break;
                case "FILTER_COLOUR":
                    handleFilterColour(session, input, brand);
                    break;
                case "SHOW_CATALOGUE":
                    handleShowCatalogue(session, input, brand);
                    break;
                case "SMART_NUDGE":
                    handleSmartNudge(session, input, brand);
                    break;
                default:
                    // Fallback to greeting
                    session.setCurrentStep("GREETING_PRODUCT");
                    sessionRepository.save(session);
                    startFlow(phone, brand);
                    break;
            }
        } catch (Exception e) {
            log.error("Error in bot flow machine", e);
            messagingService.sendTextMessage(phone, "Sorry, something went wrong. Let's start over! Type *reset* to begin.", brand);
        }
    }

    private void startFlow(String phone, Brand brand) {
        // Initial setup - default first product from brand for Greeting
        List<Product> products = productRepository.findByBrandId(brand.getId());
        Product featuredProduct = products.isEmpty() ? null : products.get(0);

        BotSession session = new BotSession();
        session.setPhone(phone);
        session.setBrand(brand);
        session.setCurrentStep("GREETING_PRODUCT");
        session.setStatus("ACTIVE");
        if (featuredProduct != null) {
            session.setProduct(featuredProduct);
        }
        sessionRepository.save(session);

        // Send GREETING + PRODUCT HOOK
        String greetingText = String.format("Hey! 👋 Loving the %s from our ad?",
                featuredProduct != null ? featuredProduct.getName() : "latest apparel");

        if (featuredProduct != null) {
            Map<String, Object> productDetails = Map.of(
                "id", featuredProduct.getId(),
                "name", featuredProduct.getName(),
                "price", formatINR(featuredProduct.getPrice()),
                "imageUrl", featuredProduct.getImageUrl() != null ? featuredProduct.getImageUrl() : "",
                "category", featuredProduct.getCategory(),
                "colours", featuredProduct.getColours()
            );
            messagingService.sendProductCard(phone, productDetails, 
                List.of("Yes, I want it 😍", "What's the price?", "Show other styles"), brand);
        } else {
            messagingService.sendButtonsMessage(phone, greetingText,
                List.of("Yes, I want it 😍", "Show styles"), brand);
        }
    }

    private void handleGreetingProduct(BotSession session, String input, Brand brand) {
        String lowerInput = input.toLowerCase();

        // Hindi and English intent matching
        boolean wantsToBuy = lowerInput.contains("want it") || lowerInput.contains("yes") || lowerInput.contains("😍")
                || lowerInput.equals("ha") || lowerInput.equals("haan") || lowerInput.contains("chahiye") || lowerInput.contains("buy");
        boolean askPrice = lowerInput.contains("price") || lowerInput.contains("rate") || lowerInput.contains("cost")
                || lowerInput.contains("batao") || lowerInput.contains("kitne ka");
        boolean showOther = lowerInput.contains("other") || lowerInput.contains("style") || lowerInput.contains("nahi")
                || lowerInput.equals("na") || lowerInput.equals("no") || lowerInput.contains("budget");

        if (wantsToBuy) {
            // Move to Capture Details Name
            session.setCurrentStep("CAPTURE_DETAILS_NAME");
            sessionRepository.save(session);
            messagingService.sendTextMessage(session.getPhone(), "Awesome choice! Let's get your delivery details.\n\nCould you please reply with your *Full Name*?", brand);
        } else if (askPrice) {
            Product prod = session.getProduct();
            if (prod != null) {
                String priceMsg = String.format("The price of *%s* is *%s*.", prod.getName(), formatINR(prod.getPrice()));
                messagingService.sendButtonsMessage(session.getPhone(), priceMsg, 
                    List.of("Yes, I want it 😍", "Show other styles"), brand);
            } else {
                messagingService.sendButtonsMessage(session.getPhone(), "Prices start from as low as ₹699! Ready to check styles?", 
                    List.of("Show other styles"), brand);
            }
        } else if (showOther) {
            // Move to Hesitation Budgets
            session.setCurrentStep("HESITATION_BUDGET");
            sessionRepository.save(session);
            messagingService.sendButtonsMessage(session.getPhone(), "No worries at all! What's your budget range for shopping today?",
                List.of("Under ₹1000", "Around ₹2000", "₹3000+"), brand);
        } else {
            // Fallback
            sendFallback(session.getPhone(), List.of("Yes, I want it 😍", "What's the price?", "Show other styles"), brand);
        }
    }

    private void handleCaptureDetailsName(BotSession session, String input, Brand brand) {
        if (input.length() < 2) {
            messagingService.sendTextMessage(session.getPhone(), "Please enter a valid name (at least 2 letters):", brand);
            return;
        }

        // Store customer name temporarily in orders table or keep in session data (we'll save in session order creation later)
        // Let's create an Order record with PENDING status to capture details
        Order order = new Order();
        order.setBrand(brand);
        order.setCustomerName(input);
        order.setPhone(session.getPhone());
        order.setProduct(session.getProduct());
        order.setProductName(session.getProduct() != null ? session.getProduct().getName() : "Custom Style");
        order.setAmount(session.getProduct() != null ? session.getProduct().getPrice() : BigDecimal.ZERO);
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);

        session.setOrderId(savedOrder.getId());
        session.setCurrentStep("CAPTURE_DETAILS_ADDRESS");
        sessionRepository.save(session);

        messagingService.sendTextMessage(session.getPhone(), "Got it, *" + input + "*!\n\nNow, please send us your complete *Delivery Address* (including City, State, and Pin Code):", brand);
    }

    private void handleCaptureDetailsAddress(BotSession session, String input, Brand brand) {
        if (input.length() < 10) {
            messagingService.sendTextMessage(session.getPhone(), "Address seems a bit short. Please enter your complete delivery address:", brand);
            return;
        }

        Order order = orderRepository.findById(session.getOrderId())
                .orElse(new Order());
        order.setAddress(input);

        // Calculate final amount with brand discount if applicable
        BigDecimal originalPrice = session.getProduct() != null ? session.getProduct().getPrice() : BigDecimal.ZERO;
        BigDecimal discountPercent = new BigDecimal(brand.getDiscountPercent()).divide(new BigDecimal(100));
        
        // Smart nudge triggers discount
        boolean hasDiscount = session.getProduct() != null;
        BigDecimal discount = hasDiscount ? originalPrice.multiply(discountPercent).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal finalAmount = originalPrice.subtract(discount);

        order.setAmount(finalAmount);
        order.setDiscountApplied(discount);
        orderRepository.save(order);

        session.setCurrentStep("PAYMENT_SELECTION");
        sessionRepository.save(session);

        messagingService.sendButtonsMessage(session.getPhone(), 
                "Perfect! We have captured your address. How would you like to make the payment?",
                List.of("Cash on Delivery 💵", "Pay with GPay / UPI", "Pay later"), brand);
    }

    private void handlePaymentSelection(BotSession session, String input, Brand brand) {
        String lowerInput = input.toLowerCase();
        Order order = orderRepository.findById(session.getOrderId())
                .orElseThrow(() -> new IllegalStateException("Order not found during payment: " + session.getOrderId()));

        if (lowerInput.contains("cash") || lowerInput.contains("cod") || lowerInput.contains("delivery")) {
            order.setPaymentMethod("COD");
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            session.setStatus("COMPLETED");
            sessionRepository.save(session);

            String confirmationMsg = String.format("Thank you! Your order for *%s* (Total: %s) has been *CONFIRMED* via Cash on Delivery (COD) 💵.\n\nWe will ship it to you shortly. Have a great day! 🎉",
                    order.getProductName(), formatINR(order.getAmount()));
            messagingService.sendTextMessage(session.getPhone(), confirmationMsg, brand);

        } else if (lowerInput.contains("gpay") || lowerInput.contains("upi") || lowerInput.contains("pay with")) {
            order.setPaymentMethod("UPI");
            orderRepository.save(order);

            // Generate Razorpay Link
            String payLink = razorpayService.createPaymentLink(order);
            order.setRazorpayPaymentLink(payLink);
            orderRepository.save(order);

            // Note: Keep session ACTIVE in PAYMENT_SELECTION so customer can pay, or if payment callback completes, it marks it COMPLETED.
            String upiMsg = String.format("Awesome! Here is your secure Razorpay payment link to pay via GPay/PhonePe/UPI:\n\n🔗 %s\n\nOnce payment is completed, your order will be confirmed instantly! 👍", payLink);
            messagingService.sendTextMessage(session.getPhone(), upiMsg, brand);

        } else if (lowerInput.contains("later") || lowerInput.contains("bnpl")) {
            order.setPaymentMethod("BNPL");
            order.setStatus("PENDING"); // needs brand follow up
            orderRepository.save(order);

            session.setStatus("COMPLETED");
            sessionRepository.save(session);

            String bnplMsg = String.format("Got it! We have marked your order for *%s* as Pay Later. Our team will contact you shortly to confirm and process it. Thank you! 👋",
                    order.getProductName());
            messagingService.sendTextMessage(session.getPhone(), bnplMsg, brand);
        } else {
            sendFallback(session.getPhone(), List.of("Cash on Delivery 💵", "Pay with GPay / UPI", "Pay later"), brand);
        }
    }

    private void handleHesitationBudget(BotSession session, String input, Brand brand) {
        Integer maxPrice = null;
        if (input.contains("1000")) {
            maxPrice = 1000;
        } else if (input.contains("2000")) {
            maxPrice = 2999;
        } else if (input.contains("3000")) {
            maxPrice = 100000;
        }

        if (maxPrice == null) {
            sendFallback(session.getPhone(), List.of("Under ₹1000", "Around ₹2000", "₹3000+"), brand);
            return;
        }

        session.setBudget(maxPrice);
        session.setCurrentStep("FILTER_CATEGORY");
        sessionRepository.save(session);

        messagingService.sendButtonsMessage(session.getPhone(), "Got it! What item are you looking for today?",
                List.of("Shirts", "T-Shirts", "Jeans", "Trousers"), brand);
    }

    private void handleFilterCategory(BotSession session, String input, Brand brand) {
        List<String> validCategories = List.of("Shirts", "T-Shirts", "Jeans", "Trousers");
        String matchedCategory = null;
        for (String cat : validCategories) {
            if (input.toLowerCase().contains(cat.toLowerCase())) {
                matchedCategory = cat;
                break;
            }
        }

        if (matchedCategory == null) {
            sendFallback(session.getPhone(), validCategories, brand);
            return;
        }

        session.setCategory(matchedCategory);
        session.setCurrentStep("FILTER_COLOUR");
        sessionRepository.save(session);

        messagingService.sendButtonsMessage(session.getPhone(), "Excellent choice. Pick a colour preference:",
                List.of("Navy/Blue", "Black", "White/Grey", "Any colour"), brand);
    }

    private void handleFilterColour(BotSession session, String input, Brand brand) {
        List<String> validColours = List.of("Navy/Blue", "Black", "White/Grey", "Any colour");
        String matchedColour = null;
        for (String col : validColours) {
            if (input.toLowerCase().contains(col.split("/")[0].toLowerCase()) || input.toLowerCase().contains("any")) {
                matchedColour = col;
                break;
            }
        }

        if (matchedColour == null) {
            sendFallback(session.getPhone(), validColours, brand);
            return;
        }

        session.setColour(matchedColour);
        session.setCurrentStep("SHOW_CATALOGUE");
        sessionRepository.save(session);

        // Fetch matching products
        BigDecimal maxPrice = session.getBudget() != null ? new BigDecimal(session.getBudget()) : null;
        List<Product> products = productRepository.findFilteredProducts(
                brand.getId(),
                session.getCategory(),
                session.getColour(),
                maxPrice
        );

        if (products.isEmpty()) {
            messagingService.sendButtonsMessage(session.getPhone(), 
                "Aww, we don't have items matching this specific filter in stock. Would you like to check other categories?",
                List.of("Filter again", "Shirts", "T-Shirts"), brand);
            session.setCurrentStep("FILTER_CATEGORY");
            sessionRepository.save(session);
            return;
        }

        // Send products (first page: up to 4 items)
        List<Map<String, Object>> productList = new java.util.ArrayList<>();
        for (Product p : products.subList(0, Math.min(products.size(), 4))) {
            productList.add(Map.of(
                "id", p.getId(),
                "name", p.getName(),
                "price", formatINR(p.getPrice()),
                "imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "",
                "category", p.getCategory(),
                "colours", p.getColours()
            ));
        }

        String bodyText = String.format("Here are our top picks for you in *%s* under *%s* 👇\n\nTap the product you like to unlock a surprise discount!",
                session.getCategory(), 
                session.getBudget() > 50000 ? "₹3000+" : "₹" + session.getBudget());
        
        messagingService.sendMultiProductMessage(session.getPhone(), bodyText, productList, products.size() > 4, brand);
    }

    private void handleShowCatalogue(BotSession session, String input, Brand brand) {
        if (input.toLowerCase().contains("filter again")) {
            session.setCurrentStep("HESITATION_BUDGET");
            sessionRepository.save(session);
            messagingService.sendButtonsMessage(session.getPhone(), "Sure! Let's choose the budget again:",
                List.of("Under ₹1000", "Around ₹2000", "₹3000+"), brand);
            return;
        }

        // Check if user selected a product by typing its name or clicking button.
        // We will match the product name or ID.
        BigDecimal maxPrice = session.getBudget() != null ? new BigDecimal(session.getBudget()) : null;
        List<Product> products = productRepository.findFilteredProducts(
                brand.getId(),
                session.getCategory(),
                session.getColour(),
                maxPrice
        );

        Product selectedProduct = null;
        for (Product p : products) {
            if (input.toLowerCase().contains(p.getName().toLowerCase()) || input.contains(String.valueOf(p.getId()))) {
                selectedProduct = p;
                break;
            }
        }

        // If not found by exact, try to match if user clicked "Buy" or tapped
        if (selectedProduct == null && !products.isEmpty()) {
            // Default to the first matching product for this response
            selectedProduct = products.get(0);
        }

        if (selectedProduct == null) {
            messagingService.sendTextMessage(session.getPhone(), "Please pick a product or tap 'Filter again' to start over.", brand);
            return;
        }

        // Store selected product
        session.setProduct(selectedProduct);
        session.setCurrentStep("SMART_NUDGE");
        sessionRepository.save(session);

        // Smart Nudge sends discount offer!
        BigDecimal discountPercent = new BigDecimal(brand.getDiscountPercent());
        BigDecimal originalPrice = selectedProduct.getPrice();
        BigDecimal discount = originalPrice.multiply(discountPercent.divide(new BigDecimal(100))).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discountedPrice = originalPrice.subtract(discount);

        String nudgeText = String.format("Great choice! The *%s* looks absolutely stunning! ✨\n\nOriginal Price: ~%s~\n*Special ChatCart Offer: %s* (%s%% off!)\n\nWe only have a few pieces left in stock. Secure yours now! 👇",
                selectedProduct.getName(),
                formatINR(originalPrice),
                formatINR(discountedPrice),
                brand.getDiscountPercent()
        );

        messagingService.sendButtonsMessage(session.getPhone(), nudgeText, 
                List.of("Pay with COD 💵", "Pay with GPay", "Show other styles"), brand);
    }

    private void handleSmartNudge(BotSession session, String input, Brand brand) {
        String lowerInput = input.toLowerCase();

        if (lowerInput.contains("styles") || lowerInput.contains("show other")) {
            session.setCurrentStep("HESITATION_BUDGET");
            sessionRepository.save(session);
            messagingService.sendButtonsMessage(session.getPhone(), "Let's find the right apparel for you. budget:",
                List.of("Under ₹1000", "Around ₹2000", "₹3000+"), brand);
            return;
        }

        boolean payCOD = lowerInput.contains("cod") || lowerInput.contains("cash");
        boolean payUPI = lowerInput.contains("gpay") || lowerInput.contains("upi") || lowerInput.contains("pay with");

        if (payCOD || payUPI) {
            // Check if details are already captured (we look if an order exists or if we should capture details)
            // If they just registered, details are not captured yet
            session.setCurrentStep("CAPTURE_DETAILS_NAME");
            sessionRepository.save(session);

            // Pre-save the payment choice inside session so we can skip confirmation button later
            // We ask for details first
            messagingService.sendTextMessage(session.getPhone(), "Excited to get this shipped to you! 🚀\n\nPlease reply with your *Full Name* to complete the order:", brand);
        } else {
            sendFallback(session.getPhone(), List.of("Pay with COD 💵", "Pay with GPay", "Show other styles"), brand);
        }
    }

    private void sendFallback(String phone, List<String> buttonOptions, Brand brand) {
        String fallbackText = "Sorry, I didn't quite get that. Please tap one of the options below or type *reset* to restart 😊";
        messagingService.sendButtonsMessage(phone, fallbackText, buttonOptions, brand);
    }

    private String formatINR(BigDecimal amount) {
        return "₹" + String.format("%,.0f", amount); // simple Indian style comma formatting (no decimals for clean currency look)
    }
}
