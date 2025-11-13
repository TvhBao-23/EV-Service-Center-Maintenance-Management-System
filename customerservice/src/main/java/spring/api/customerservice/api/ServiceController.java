package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.Service;
import spring.api.customerservice.repository.ServiceRepository;

import java.util.List;

@RestController
@RequestMapping(value = "/api/customers/services", produces = "application/json;charset=UTF-8")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepository;

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceRepository.findAll();
        // Fix encoding for service names if needed
        services.forEach(service -> {
            if (service.getName() != null) {
                String name = service.getName();
                // If name contains encoding issues, try to fix it
                if (name.contains("Ã") || name.contains("áº") || name.contains("Æ°")) {
                    try {
                        // Try to decode as if it was UTF-8 bytes interpreted as Latin1
                        byte[] bytes = new byte[name.length()];
                        for (int i = 0; i < name.length(); i++) {
                            bytes[i] = (byte) (name.charAt(i) & 0xFF);
                        }
                        String decoded = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                        service.setName(decoded);
                    } catch (Exception e) {
                        // If decoding fails, keep original
                        System.err.println("Failed to decode service name: " + name);
                    }
                }
            }
        });
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getService(@PathVariable Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return ResponseEntity.ok(service);
    }

    /**
     * Get all distinct service categories (loại dịch vụ)
     * Returns list of category names like: ["battery", "charging", "motor", ...]
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getServiceCategories() {
        List<String> categories = serviceRepository.findDistinctCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get services by category (lấy các service cụ thể trong một loại)
     * Example: GET /api/customers/services?category=battery
     */
    @GetMapping(params = "category")
    public ResponseEntity<List<Service>> getServicesByCategory(@RequestParam String category) {
        System.out.println("[ServiceController] Getting services for category: " + category);
        List<Service> services = serviceRepository.findByCategory(category);
        System.out.println("[ServiceController] Found " + services.size() + " services for category: " + category);
        for (Service s : services) {
            System.out.println("[ServiceController] - Service ID: " + s.getServiceId() + ", Name: " + s.getName()
                    + ", Price: " + s.getBasePrice());
        }
        return ResponseEntity.ok(services);
    }
}
