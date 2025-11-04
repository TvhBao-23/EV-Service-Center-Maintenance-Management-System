package spring.api.maintenance.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Helper Controller để hash password (chỉ dùng cho development/testing)
 */
@RestController
@RequestMapping("/api/helper")
@CrossOrigin(origins = "*")
public class PasswordHelperController {

    private final BCryptPasswordEncoder passwordEncoder;

    public PasswordHelperController() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Hash password và trả về hash
     * POST /api/helper/hash-password
     * Body: {"password": "password123"}
     */
    @PostMapping("/hash-password")
    public ResponseEntity<Map<String, String>> hashPassword(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        if (password == null || password.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Password is required");
            return ResponseEntity.badRequest().body(error);
        }

        String hashedPassword = passwordEncoder.encode(password);
        
        Map<String, String> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hashedPassword);
        response.put("message", "Use this hash in your SQL INSERT statement");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Hash nhiều passwords cùng lúc
     * POST /api/helper/hash-passwords
     * Body: {"passwords": ["password123", "admin123"]}
     */
    @PostMapping("/hash-passwords")
    public ResponseEntity<Map<String, Object>> hashPasswords(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        java.util.List<String> passwords = (java.util.List<String>) request.get("passwords");
        
        if (passwords == null || passwords.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Passwords array is required");
            return ResponseEntity.badRequest().body(error);
        }

        Map<String, Object> response = new HashMap<>();
        java.util.List<Map<String, String>> results = new java.util.ArrayList<>();
        
        for (String password : passwords) {
            Map<String, String> item = new HashMap<>();
            item.put("password", password);
            item.put("hash", passwordEncoder.encode(password));
            results.add(item);
        }
        
        response.put("results", results);
        response.put("message", "Use these hashes in your SQL INSERT statements");
        
        return ResponseEntity.ok(response);
    }
}

