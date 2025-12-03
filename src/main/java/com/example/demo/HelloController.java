package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String hello() {
        return "Hello! Your Spring Boot application is running successfully!";
    }

    @GetMapping("/api/greeting")
    public String greeting() {
        return "Welcome to Spring Boot!";
    }

}
