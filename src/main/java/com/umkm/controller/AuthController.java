package com.umkm.controller;

import com.umkm.entity.Role;
import com.umkm.entity.User;
import com.umkm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.umkm.entity.PasswordResetToken;
import com.umkm.repository.PasswordResetTokenRepository;
import com.umkm.entity.Order;
import com.umkm.repository.OrderRepository;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.Data;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final HttpSessionSecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already taken!");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        Role role;
        try {
            String roleStr = request.getRole().toUpperCase();
            if (roleStr.equals("PEMBELI")) {
                role = Role.BUYER;
            } else if (roleStr.equals("PENJUAL")) {
                role = Role.SELLER;
            } else {
                role = Role.valueOf(roleStr);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: Role must be either BUYER/SELLER or PEMBELI/PENJUAL");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseGet(() -> userRepository.findByEmail(request.getUsername()).orElse(null));

            if (user == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("User not found"));
            }

            return ResponseEntity.ok(new LoginResponse(user.getRole().name()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid credentials"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Email tidak ditemukan!"));
        }

        User user = userOpt.get();
        
        // Hapus token lama jika ada (agar tidak menumpuk)
        // Note: di aplikasi production yang kompleks mungkin kita butuh Transactional service, 
        // tapi untuk scope ini kita langsung panggil di controller atau biarkan token lama tertumpuk sementara.
        // Mari kita buat token baru saja.
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 jam
                .build();
                
        tokenRepository.save(resetToken);

        // Simulasi pengiriman email
        String resetUrl = "http://localhost:8081/reset-password.html?token=" + token;
        System.out.println("\n\n=======================================================");
        System.out.println("SIMULASI EMAIL TERKIRIM KE: " + user.getEmail());
        System.out.println("Klik link berikut untuk mereset password Anda:");
        System.out.println(resetUrl);
        System.out.println("=======================================================\n\n");

        return ResponseEntity.ok("Tautan reset password telah dikirim ke email Anda!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Token tidak valid!"));
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.getExpiryDate().before(new Date())) {
            tokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(new ErrorResponse("Token sudah kedaluwarsa!"));
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return ResponseEntity.ok("Password berhasil diubah!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(new ErrorResponse("Unauthorized"));
        }

        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username));

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new UserResponse(user.getUsername(), user.getEmail(), user.getRole().name()));
    }

    @DeleteMapping("/me")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteMe(jakarta.servlet.http.HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Unauthorized"));
        }

        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username));

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found"));
        }

        User user = userOpt.get();

        // 1. Delete all reset password tokens
        tokenRepository.deleteByUser(user);

        // 2. Delete all orders associated with user (buyer or seller)
        List<Order> buyerOrders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(user.getId());
        orderRepository.deleteAll(buyerOrders);

        List<Order> sellerOrders = orderRepository.findBySellerIdOrderByCreatedAtDesc(user.getId());
        orderRepository.deleteAll(sellerOrders);

        // 3. Delete the user (cascades to products)
        userRepository.delete(user);

        // 4. Logout / invalidate session
        SecurityContextHolder.clearContext();
        jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(Map.of("message", "Akun berhasil dihapus."));
    }
}

@Data
class UserResponse {
    private String username;
    private String email;
    private String role;
    public UserResponse(String username, String email, String role) {
        this.username = username;
        this.email = email;
        this.role = role;
    }
}

@Data
class ErrorResponse {
    private String error;
    public ErrorResponse(String error) { this.error = error; }
}

@Data
class LoginRequest {
    private String username;
    private String password;
}

@Data
class LoginResponse {
    private String role;
    public LoginResponse(String role) { this.role = role; }
}

@Data
class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role;
}

@Data
class ForgotPasswordRequest {
    private String email;
}

@Data
class ResetPasswordRequest {
    private String token;
    private String newPassword;
}
