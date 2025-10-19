package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.repository.CustomerRepository;
import spring.api.customerservice.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestAttribute("user_id") Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        Customer customer = customerRepository.findByUserId(userId)
                .orElse(null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("user_id", user.getUserId());
        response.put("email", user.getEmail());
        response.put("full_name", user.getFullName());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());
        
        if (customer != null) {
            response.put("customer_id", customer.getCustomerId());
            response.put("address", customer.getAddress());
        }
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestAttribute("user_id") Long userId,
            @RequestBody Map<String, String> updates) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        if (updates.containsKey("full_name")) {
            user.setFullName(updates.get("full_name"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone"));
        }
        userRepository.save(user);
        
        Customer customer = customerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setUserId(userId);
                    return newCustomer;
                });
        
        if (updates.containsKey("address")) {
            customer.setAddress(updates.get("address"));
        }
        customerRepository.save(customer);
        
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }
}

