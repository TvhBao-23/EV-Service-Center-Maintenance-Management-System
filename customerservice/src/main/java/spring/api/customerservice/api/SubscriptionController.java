package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.CustomerSubscription;
import spring.api.customerservice.domain.ServicePackage;
import spring.api.customerservice.domain.User;
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
        if (authentication == null) {
            throw new RuntimeException("Vui lòng đăng nhập để đăng ký gói dịch vụ");
        }
        User user = (User) authentication.getPrincipal();
        Long customerId = user.getUserId();
        
        CustomerSubscription subscription = subscriptionService.subscribe(customerId, packageId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng ký gói dịch vụ thành công");
        response.put("subscription", subscription);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-subscriptions")
    public ResponseEntity<List<CustomerSubscription>> getMySubscriptions(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        User user = (User) authentication.getPrincipal();
        Long customerId = user.getUserId();
        return ResponseEntity.ok(subscriptionService.getCustomerSubscriptions(customerId));
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<CustomerSubscription>> getActiveSubscriptions(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        User user = (User) authentication.getPrincipal();
        Long customerId = user.getUserId();
        return ResponseEntity.ok(subscriptionService.getActiveSubscriptions(customerId));
    }
    
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<Map<String, String>> cancelSubscription(
            @PathVariable Long subscriptionId,
            Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Vui lòng đăng nhập để hủy gói dịch vụ");
        }
        subscriptionService.cancelSubscription(subscriptionId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hủy gói dịch vụ thành công");
        
        return ResponseEntity.ok(response);
    }
}

