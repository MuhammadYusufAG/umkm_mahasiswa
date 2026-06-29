package com.umkm.controller;

import com.umkm.entity.Role;
import com.umkm.entity.User;
import com.umkm.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import lombok.Data;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
}

@Data
class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role;
}
