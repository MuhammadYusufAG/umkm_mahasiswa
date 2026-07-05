package com.umkm.config;

import com.umkm.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/products/public/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/dashboardPenjual", "/dashboardPenjual.html", "/kelolaProduk", "/kelolaProduk.html", "/stokProduk", "/stokProduk.html", "/pesananPenjual", "/pesananPenjual.html", "/api/products/seller/**").hasRole("SELLER")
                .requestMatchers("/login", "/login.html", "/registrasi", "/registrasi.html", "/forgot-password", "/forgot-password.html", "/reset-password", "/reset-password.html", "/css/**", "/js/**", "/images/**", "/uploads/**", "/dashboard", "/dashboard.html",
                    "/kategoriMakanan", "/kategoriminuman", "/kategorisnack", "/kategoridessert", "/kategoriAksesoris", "/kategoriTulis", "/kategorikopi", "/kategorijus", "/pesanan", "/pesanan.html",
                    "/kategoriMakanan.html", "/kategoriMinuman.html", "/kategoriSnack.html", "/kategoriDessert.html", "/kategoriAksesoris.html", "/kategoriTulis.html", "/kategoriKopi.html", "/kategoriJus.html").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login")
                .permitAll()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
