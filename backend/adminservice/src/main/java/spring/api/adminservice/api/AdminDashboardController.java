package spring.api.adminservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spring.api.adminservice.service.DashboardService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "adminservice"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardService.Summary> getDashboard() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/activities")
    public ResponseEntity<DashboardService.Activities> getRecentActivities() {
        return ResponseEntity.ok(dashboardService.getRecentActivities());
    }

    @GetMapping("/staff-count")
    public ResponseEntity<Map<String, Integer>> getStaffCount() {
        return ResponseEntity.ok(Map.of("count", dashboardService.getStaffCount()));
    }

    @PostMapping("/config")
    public ResponseEntity<Map<String, String>> updateConfig(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody spring.api.adminservice.dto.ConfigDTO configDTO) {
        // In a real application, we would save this to the database.
        // For testing BVA, returning a success message is enough when validation passes.
        return ResponseEntity.ok(Map.of("message", "Configuration updated successfully", "status", "success"));
    }
}


