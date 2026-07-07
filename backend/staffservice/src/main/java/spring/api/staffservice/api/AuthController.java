package spring.api.staffservice.api;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import spring.api.staffservice.domain.User;
import spring.api.staffservice.domain.UserRole;
import spring.api.staffservice.repository.UserRepository;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
// CORS is handled by API Gateway
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${jwt.secret}")
    private String jwtSecret;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String fullName = request.get("fullName");
            String phone = request.get("phone");
            String roleStr = request.get("role");

            System.out.println("=== REGISTRATION ATTEMPT ===");
            System.out.println("Email: " + email);
            System.out.println("Role: " + roleStr);

            // Validate required fields
            if (email == null || password == null || fullName == null || roleStr == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Vui lòng điền đầy đủ thông tin"));
            }

            // Parse role
            UserRole role;
            try {
                role = UserRole.valueOf(roleStr.toLowerCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Vai trò không hợp lệ"));
            }

            // Only allow staff and technician registration
            if (role != UserRole.staff && role != UserRole.technician) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Chỉ được đăng ký tài khoản Nhân viên hoặc Kỹ thuật viên"));
            }

            // Check if email already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email đã được sử dụng"));
            }

            // Create new user
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFullName(fullName);
            user.setPhone(phone);
            user.setRole(role);
            user.setCreatedAt(java.time.LocalDateTime.now());
            user.setUpdatedAt(java.time.LocalDateTime.now());

            User savedUser = userRepository.save(user);

            System.out.println("REGISTRATION SUCCESS: " + savedUser.getEmail() + " (" + savedUser.getRole() + ")");

            // Generate JWT token
            String token = generateToken(savedUser);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "userId", savedUser.getUserId(),
                "email", savedUser.getEmail(),
                "fullName", savedUser.getFullName(),
                "phone", savedUser.getPhone() != null ? savedUser.getPhone() : "",
                "role", savedUser.getRole().name()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("REGISTRATION ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            System.out.println("=== LOGIN ATTEMPT ===");
            System.out.println("Email: " + email);
            System.out.println("Password length: " + (password != null ? password.length() : 0));

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email và mật khẩu không được để trống"));
            }

            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng"));

            System.out.println("User found: " + user.getEmail());
            System.out.println("User role: " + user.getRole());
            System.out.println("User role type: " + user.getRole().getClass().getName());
            System.out.println("Password hash: " + user.getPassword().substring(0, 20) + "...");

            // Check if user is staff/technician/admin
            if (user.getRole() == UserRole.customer) {
                System.out.println("REJECTED: Customer account");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Tài khoản này không có quyền truy cập"));
            }

            System.out.println("Role check passed");

            // Verify password
            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
            System.out.println("Password matches: " + passwordMatches);
            
            if (!passwordMatches) {
                System.out.println("REJECTED: Password mismatch");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email hoặc mật khẩu không đúng"));
            }

            System.out.println("LOGIN SUCCESS");

            // Generate JWT token
            String token = generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "phone", user.getPhone(),
                "role", user.getRole().name()
            ));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Không tìm thấy token xác thực"));
            }

            String token = authHeader.substring(7);
            var claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Object userIdObj = claims.get("user_id");
            Long userId = userIdObj instanceof Integer ? ((Integer) userIdObj).longValue() : (Long) userIdObj;
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("staffId", user.getUserId());
            profile.put("userId", user.getUserId());
            profile.put("email", user.getEmail());
            profile.put("fullName", user.getFullName());
            profile.put("phone", user.getPhone());
            profile.put("role", user.getRole().name());
            profile.put("isActive", true);

            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Token không hợp lệ"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "staffservice-auth"));
    }

    // Temporary endpoint to generate password hash
    @GetMapping("/generate-hash")
    public ResponseEntity<Map<String, String>> generateHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        return ResponseEntity.ok(Map.of("password", password, "hash", hash));
    }

    private String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 86400000); // 24 hours

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("user_id", user.getUserId())
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}

