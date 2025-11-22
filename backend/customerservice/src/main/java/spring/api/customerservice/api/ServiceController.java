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
        // Fix encoding for all services
        services.forEach(this::fixServiceEncoding);
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

        // Fix encoding for all services
        services.forEach(this::fixServiceEncoding);

        System.out.println("[ServiceController] Found " + services.size() + " services for category: " + category);
        for (Service s : services) {
            System.out.println("[ServiceController] - Service ID: " + s.getServiceId() + ", Name: " + s.getName()
                    + ", Price: " + s.getBasePrice());
        }
        return ResponseEntity.ok(services);
    }

    /**
     * Fix encoding issues in service name and description
     */
    private void fixServiceEncoding(Service service) {
        if (service.getName() != null) {
            service.setName(fixStringEncoding(service.getName()));
        }
        if (service.getDescription() != null) {
            service.setDescription(fixStringEncoding(service.getDescription()));
        }
    }

    /**
     * Fix common UTF-8 encoding issues
     */
    private String fixStringEncoding(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }

        // Check if string has encoding issues (including single ? character)
        if (str.contains("???") || str.contains("Ã") || str.contains("áº") || str.contains("Æ°")
                || str.contains("á»") || str.contains("S?a") || str.contains("h?") || str.contains("B?o")
                || str.contains("?") || str.contains("")) {
            try {
                // Try to decode as if it was UTF-8 bytes interpreted as Latin1
                byte[] bytes = new byte[str.length()];
                for (int i = 0; i < str.length(); i++) {
                    bytes[i] = (byte) (str.charAt(i) & 0xFF);
                }
                String decoded = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);

                // If decoded is different and doesn't contain encoding artifacts, use it
                if (!decoded.equals(str) && !decoded.contains("???") && !decoded.contains("?")
                        && !decoded.contains("")) {
                    System.out.println("[ServiceController] Fixed encoding: '" + str + "' -> '" + decoded + "'");
                    return decoded;
                }
            } catch (Exception e) {
                System.err.println("[ServiceController] Failed to fix encoding for string: " + str);
            }

            // Manual replacement for common Vietnamese encoding issues
            String fixed = str
                    .replace("áº", "ư")
                    .replace("á»", "ộ")
                    .replace("á»", "ệ")
                    .replace("á»", "ồ")
                    .replace("á»", "ề")
                    .replace("Ã¡", "á")
                    .replace("Ã©", "é")
                    .replace("Ã­", "í")
                    .replace("Ã³", "ó")
                    .replace("Ãº", "ú")
                    .replace("Ã½", "ý")
                    .replace("á»", "à")
                    .replace("á»", "è")
                    .replace("á»", "ì")
                    .replace("á»", "ò")
                    .replace("á»", "ù")
                    .replace("S?a", "Sửa")
                    .replace("ch?a", "chữa")
                    .replace("h?", "hệ")
                    .replace("th?ng", "thống")
                    .replace("s?c", "sạc")
                    .replace("B?o", "Bảo")
                    .replace("d??ng", "dưỡng")
                    .replace("l?m", "làm")
                    .replace("m?t", "mát")
                    .replace("???", "")
                    // Fix specific patterns
                    .replace("B?o d?ng", "Bảo dưỡng")
                    .replace("?nh k?", "định kỳ")
                    .replace("?i?n", "điện")
                    .replace("?p nh?t", "ập nhật")
                    .replace("ph?n m?m", "phần mềm")
                    .replace("h?th?ng", "hệ thống")
                    .replace("qu?n l?y", "quản lý")
                    .replace("c?m bi?n", "cảm biến")
                    .replace("nhi?t?", "nhiệt độ")
                    .replace("?", "độ")
                    .replace("?", "");

            // If still contains ?, try one more pass with common replacements
            if (fixed.contains("?") && !str.equals(fixed)) {
                fixed = fixed
                        .replace("?nh", "định")
                        .replace("?i", "đi")
                        .replace("?p", "ập")
                        .replace("?n", "ần")
                        .replace("?m", "ềm")
                        .replace("?ng", "ống")
                        .replace("?y", "ấy")
                        .replace("?", "");
            }

            return fixed;
        }

        return str;
    }
}
