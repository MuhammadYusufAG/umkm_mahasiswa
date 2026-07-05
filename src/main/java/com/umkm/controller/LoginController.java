package com.umkm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        return "forward:/login.html";
    }

    @GetMapping("/registrasi")
    public String registrasi() {
        return "forward:/registrasi.html";
    }

    @GetMapping("/logout")
    public String logout(jakarta.servlet.http.HttpServletRequest request) {
        if (request.getSession(false) != null) {
            request.getSession().invalidate();
        }
        return "redirect:/login";
    }
}
