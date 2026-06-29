package com.umkm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/dashboard")
    public String showDashboard() {
        return "forward:/dashboard.html";
    }

    @GetMapping("/kategoriMakanan")
    public String kategoriMakanan() {
        return "forward:/kategoriMakanan.html";
    }

    @GetMapping("/kategoriminuman")
    public String kategoriMinuman() {
        return "forward:/kategoriMinuman.html";
    }

    @GetMapping("/kategorisnack")
    public String kategoriSnack() {
        return "forward:/kategoriSnack.html";
    }

    @GetMapping("/kategoridessert")
    public String kategoriDessert() {
        return "forward:/kategoriDessert.html";
    }

    @GetMapping("/kategoriAksesoris")
    public String kategoriAksesoris() {
        return "forward:/kategoriAksesoris.html";
    }

    @GetMapping("/kategoriTulis")
    public String kategoriTulis() {
        return "forward:/kategoriTulis.html";
    }

    @GetMapping("/kategorikopi")
    public String kategoriKopi() {
        return "forward:/kategoriKopi.html";
    }

    @GetMapping("/kategorijus")
    public String kategoriJus() {
        return "forward:/kategoriJus.html";
    }
}
