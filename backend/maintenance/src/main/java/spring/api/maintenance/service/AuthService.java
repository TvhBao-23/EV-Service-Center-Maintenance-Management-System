package spring.api.maintenance.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import spring.api.maintenance.entity.User;
import spring.api.maintenance.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> response = new HashMap<>();
        
        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email không tồn tại.");
            return response;
        }

        User user = userOptional.get();

        // Check if user is active
        if (user.getIsActive() == null || !user.getIsActive()) {
            response.put("success", false);
            response.put("message", "Tài khoản đã bị khóa.");
            return response;
        }

        // Check password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            response.put("success", false);
            response.put("message", "Email hoặc mật khẩu không đúng.");
            return response;
        }

        // If authentication successful, return user details (excluding password hash)
        response.put("success", true);
        response.put("message", "Đăng nhập thành công.");
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getUserId());
        userData.put("email", user.getEmail());
        userData.put("fullName", user.getFullName());
        userData.put("role", user.getRole().name().toLowerCase());
        response.put("user", userData);
        
        return response;
    }
}

