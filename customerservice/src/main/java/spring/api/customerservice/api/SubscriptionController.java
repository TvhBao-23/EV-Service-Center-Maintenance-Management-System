package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.CustomerSubscription;
import spring.api.customerservice.domain.ServicePackage;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.repository.CustomerRepository;
import spring.api.customerservice.service.SubscriptionService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final CustomerRepository customerRepository;
    
    @GetMapping("/packages")
    public ResponseEntity<List<ServicePackage>> getAvailablePackages() {
        return ResponseEntity.ok(subscriptionService.getAllActivePackages());
    }
    
    @GetMapping("/packages/{packageId}")
    public ResponseEntity<ServicePackage> getPackageDetails(@PathVariable Long packageId) {
        return ResponseEntity.ok(subscriptionService.getPackageById(packageId));
    }
    
    @PostMapping("/subscribe/{packageId}")
    public ResponseEntity<Map<String, Object>> subscribe(
            @PathVariable Long packageId,
            Authentication authentication) {
        try {
            // Development mode: use first customer or create new one
            CustomerSubscription subscription = subscriptionService.subscribeWithoutAuth(packageId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đăng ký gói dịch vụ thành công");
            response.put("subscription", subscription);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error subscribing: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of(
                "message", "Lỗi khi đăng ký: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/my-subscriptions")
    public ResponseEntity<List<CustomerSubscription>> getMySubscriptions(Authentication authentication) {
        System.out.println("🔍 GET my-subscriptions - Authentication: " + (authentication != null ? authentication.getName() : "NULL"));
        if (authentication == null) {
            System.out.println("⚠️ Authentication is null, returning empty list");
            return ResponseEntity.ok(new ArrayList<>());
        }
        User user = (User) authentication.getPrincipal();
        System.out.println("👤 User ID: " + user.getUserId());
        
        // Get customer from userId
        Customer customer = customerRepository.findByUserId(user.getUserId())
            .orElseThrow(() -> new RuntimeException("Customer not found for user: " + user.getUserId()));
        
        Long customerId = customer.getCustomerId();
        System.out.println("👤 Customer ID: " + customerId);
        List<CustomerSubscription> subscriptions = subscriptionService.getCustomerSubscriptions(customerId);
        System.out.println("📋 Found " + subscriptions.size() + " subscriptions");
        return ResponseEntity.ok(subscriptions);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<CustomerSubscription>> getActiveSubscriptions(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        User user = (User) authentication.getPrincipal();
        
        // Get customer from userId
        Customer customer = customerRepository.findByUserId(user.getUserId())
            .orElseThrow(() -> new RuntimeException("Customer not found for user: " + user.getUserId()));
        
        Long customerId = customer.getCustomerId();
        return ResponseEntity.ok(subscriptionService.getActiveSubscriptions(customerId));
    }
    
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<Map<String, String>> cancelSubscription(
            @PathVariable Long subscriptionId,
            Authentication authentication) {
        try {
            // Development mode: allow cancel without auth
            System.out.println("Cancelling subscription " + subscriptionId);
            subscriptionService.cancelSubscription(subscriptionId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Hủy gói dịch vụ thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error cancelling subscription: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi khi hủy gói: " + e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        }
    }
}

