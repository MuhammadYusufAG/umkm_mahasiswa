package com.umkm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UmkmApplication {

	public static void main(String[] args) {
		SpringApplication.run(UmkmApplication.class, args);
	}

}
