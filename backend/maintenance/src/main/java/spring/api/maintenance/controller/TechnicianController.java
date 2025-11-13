package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "*")
public class TechnicianController {

    @Autowired
    private RestTemplate restTemplate;

    // Lấy danh sách tất cả kỹ thuật viên từ Staff Service
    @GetMapping
    public ResponseEntity<?> getAllTechnicians() {
        try {
            // Gọi Staff Service để lấy danh sách technicians
            // Staff Service trong Docker network: staffservice (hoặc localhost:8083 nếu
            // chạy local)
            String staffServiceUrl = System.getenv("STAFF_SERVICE_URL");
            if (staffServiceUrl == null || staffServiceUrl.isEmpty()) {
                // Trong Docker network, sử dụng tên service; localhost nếu chạy local
                // Kiểm tra xem có đang chạy trong Docker không (qua biến môi trường)
                String dockerEnv = System.getenv("SPRING_PROFILES_ACTIVE");
                if (dockerEnv != null && dockerEnv.equals("docker")) {
                    // Docker network: sử dụng tên service
                    staffServiceUrl = "http://staffservice:8083/api/staff/technicians";
                } else {
                    // Local development: sử dụng localhost
                    staffServiceUrl = "http://localhost:8083/api/staff/technicians";
                }
            } else {
                staffServiceUrl = staffServiceUrl + "/technicians";
            }

            // Sử dụng ParameterizedTypeReference để deserialize List<Map<String, Object>>
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    staffServiceUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    });

            List<Map<String, Object>> technicians = response.getBody();

            if (technicians == null || technicians.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            return ResponseEntity.ok(technicians);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách kỹ thuật viên: " + e.getMessage());
        }
    }

    // Lấy kỹ thuật viên theo ID
    @GetMapping("/{technicianId}")
    public ResponseEntity<?> getTechnicianById(@PathVariable Integer technicianId) {
        try {
            // Staff Service trong Docker network: staffservice (hoặc localhost:8083 nếu
            // chạy local)
            String staffServiceUrl = System.getenv("STAFF_SERVICE_URL");
            if (staffServiceUrl == null || staffServiceUrl.isEmpty()) {
                // Kiểm tra xem có đang chạy trong Docker không
                String dockerEnv = System.getenv("SPRING_PROFILES_ACTIVE");
                if (dockerEnv != null && dockerEnv.equals("docker")) {
                    // Docker network: sử dụng tên service
                    staffServiceUrl = "http://staffservice:8083/api/staff/technicians/" + technicianId;
                } else {
                    // Local development: sử dụng localhost
                    staffServiceUrl = "http://localhost:8083/api/staff/technicians/" + technicianId;
                }
            } else {
                staffServiceUrl = staffServiceUrl + "/technicians/" + technicianId;
            }
            Map<String, Object> technician = restTemplate.getForObject(staffServiceUrl, Map.class);

            if (technician == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy kỹ thuật viên với ID: " + technicianId);
            }

            return ResponseEntity.ok(technician);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy thông tin kỹ thuật viên: " + e.getMessage());
        }
    }
}
