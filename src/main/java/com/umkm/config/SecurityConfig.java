package com.umkm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/login.html", "/css/**", "/js/**", "/images/**", "/dashboard", "/dashboard.html",
                    "/kategoriMakanan", "/kategoriminuman", "/kategorisnack", "/kategoridessert", "/kategoriAksesoris", "/kategoriTulis", "/kategorikopi", "/kategorijus",
                    "/kategoriMakanan.html", "/kategoriMinuman.html", "/kategoriSnack.html", "/kategoriDessert.html", "/kategoriAksesoris.html", "/kategoriTulis.html", "/kategoriKopi.html", "/kategoriJus.html").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )
            .logout(logout -> logout
                .permitAll()
            );

        return http.build();
    }
}
