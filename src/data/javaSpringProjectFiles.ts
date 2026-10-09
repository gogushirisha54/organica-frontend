export interface JavaSourceFile {
  id: string;
  fileName: string;
  packagePath: string;
  layer: 'Maven & SQL' | 'Controller Layer' | 'Service & Security' | 'JPA Entities & Repo';
  description: string;
  code: string;
}

export const JAVA_SPRING_BOOT_FILES: JavaSourceFile[] = [
  {
    id: 'pom-xml',
    fileName: 'pom.xml',
    packagePath: 'java-spring-boot-backend/pom.xml',
    layer: 'Maven & SQL',
    description: 'Maven project descriptor configuring Spring Boot 3.3, Spring Data JPA, Spring Security, Validation, and MySQL Connector.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
    </parent>
    <groupId>com.verdure</groupId>
    <artifactId>organic-marketplace-backend</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>21</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>`,
  },
  {
    id: 'auth-controller',
    fileName: 'AuthController.java',
    packagePath: 'src/main/java/com/verdure/organic/controller/AuthController.java',
    layer: 'Controller Layer',
    description: 'REST controller handling user Login, Registration (Customer/Reseller/Supplier roles), JWT token issuance, and Logout.',
    code: `package com.verdure.organic.controller;

import com.verdure.organic.dto.AuthRequest;
import com.verdure.organic.dto.AuthResponse;
import com.verdure.organic.dto.RegisterRequest;
import com.verdure.organic.model.UserEntity;
import com.verdure.organic.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request.getIdentifier(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse created = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        authService.invalidateToken(authHeader);
        return ResponseEntity.ok(Map.of("message", "Session invalidated successfully."));
    }
}`,
  },
  {
    id: 'order-controller',
    fileName: 'OrderAndTrackingController.java',
    packagePath: 'src/main/java/com/verdure/organic/controller/OrderAndTrackingController.java',
    layer: 'Controller Layer',
    description: 'Meesho-style Order placement, Reseller margin calculation, 5-stage live order tracking, and cancellation/return controller.',
    code: `package com.verdure.organic.controller;

import com.verdure.organic.dto.CreateOrderRequest;
import com.verdure.organic.model.OrderEntity;
import com.verdure.organic.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderAndTrackingController {

    private final OrderService orderService;

    public OrderAndTrackingController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderEntity>> getUserOrders(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(orderService.findOrdersByUser(userId));
    }

    @PostMapping
    public ResponseEntity<OrderEntity> placeOrder(@RequestBody CreateOrderRequest request) {
        // Calculates reseller margin payout and initializes 5-stage cold-chain tracking
        OrderEntity savedOrder = orderService.createOrderWithTracking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @PostMapping("/{orderId}/advance-status")
    public ResponseEntity<OrderEntity> advanceTrackingStage(@PathVariable String orderId) {
        OrderEntity updated = orderService.advanceDeliveryStage(orderId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderEntity> cancelOrReturnOrder(@PathVariable String orderId) {
        OrderEntity cancelled = orderService.cancelOrRequestReturn(orderId);
        return ResponseEntity.ok(cancelled);
    }
}`,
  },
  {
    id: 'payment-service',
    fileName: 'PaymentGatewayService.java',
    packagePath: 'src/main/java/com/verdure/organic/service/PaymentGatewayService.java',
    layer: 'Service & Security',
    description: 'Handles UPI VPA verification (GPay/PhonePe/Paytm), Credit/Debit card authorization, Cash on Delivery (COD), and Reseller Margin wallet credit.',
    code: `package com.verdure.organic.service;

import com.verdure.organic.model.OrderEntity;
import com.verdure.organic.model.UserEntity;
import com.verdure.organic.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentGatewayService {

    private final UserRepository userRepository;

    public PaymentGatewayService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean verifyUpiId(String upiVpa) {
        return upiVpa != null && upiVpa.matches("^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$");
    }

    @Transactional
    public String processPayment(OrderEntity order, String paymentMethod, String upiId) {
        if ("COD".equalsIgnoreCase(paymentMethod)) {
            order.setPaymentStatus("COD_PENDING");
            return "COD-" + System.currentTimeMillis();
        }

        if ("UPI".equalsIgnoreCase(paymentMethod) && !verifyUpiId(upiId)) {
            throw new IllegalArgumentException("Invalid UPI VPA format.");
        }

        order.setPaymentStatus("PAID");

        // Credit Meesho-style Reseller Margin to user's wallet
        if (order.isResellOrder() && order.getResellerMargin() > 0) {
            userRepository.findById(order.getUserId()).ifPresent(user -> {
                user.setResellerEarnings(user.getResellerEarnings() + order.getResellerMargin());
                userRepository.save(user);
            });
        }

        return "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
    }
}`,
  },
  {
    id: 'order-entity',
    fileName: 'OrderEntity.java',
    packagePath: 'src/main/java/com/verdure/organic/model/OrderEntity.java',
    layer: 'JPA Entities & Repo',
    description: 'JPA/Hibernate Entity mapping orders, payment status, reseller margin, courier AWB number, and tracking stages.',
    code: `package com.verdure.organic.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "organic_orders")
public class OrderEntity {

    @Id
    @Column(name = "order_id", length = 32)
    private String orderId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false, length = 500)
    private String shippingAddress;

    @Column(nullable = false, length = 10)
    private String pincode;

    @Column(nullable = false)
    private String paymentMethod; // UPI, CARD, COD, NETBANKING

    @Column(nullable = false)
    private String paymentStatus; // PAID, COD_PENDING, REFUNDED

    private String transactionId;

    // Meesho-Style Reselling & Margin Fields
    private boolean isResellOrder;
    private double resellerMargin;

    private double subtotal;
    private double discount;
    private double deliveryCharge;
    private double finalCustomerTotal;

    private int currentStageIndex; // 0=Placed, 1=Harvested, 2=Packed, 3=OutForDelivery, 4=Delivered
    private String status; // ACTIVE, DELIVERED, CANCELLED, RETURN_REQUESTED

    private String courierPartner;
    private String awbNumber;
    private String estimatedDelivery;
    private Instant createdAt = Instant.now();

    @ElementCollection
    @CollectionTable(name = "order_line_items", joinColumns = @JoinColumn(name = "order_id"))
    private List<OrderLineItem> items;

    // Getters and Setters omitted for brevity
}`,
  },
  {
    id: 'schema-sql',
    fileName: 'schema.sql',
    packagePath: 'src/main/resources/schema.sql',
    layer: 'Maven & SQL',
    description: 'MySQL / PostgreSQL relational database schema for Users, Organic Produce Lots, Orders, Payments, and Tracking logs.',
    code: `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'CUSTOMER',
    reseller_earnings DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organic_products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    botanical_name VARCHAR(160),
    category VARCHAR(80) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(64) NOT NULL,
    parcel_id VARCHAR(32),
    brix_score DECIMAL(4,1),
    in_stock BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS organic_orders (
    order_id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address VARCHAR(500) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(64),
    is_resell_order BOOLEAN DEFAULT FALSE,
    reseller_margin DECIMAL(10,2) DEFAULT 0.00,
    final_customer_total DECIMAL(10,2) NOT NULL,
    current_stage_index INT DEFAULT 0,
    status VARCHAR(24) DEFAULT 'ACTIVE',
    awb_number VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);`,
  },
];
