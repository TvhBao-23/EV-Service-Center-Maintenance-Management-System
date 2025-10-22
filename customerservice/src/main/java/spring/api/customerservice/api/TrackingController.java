package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/tracking")
@RequiredArgsConstructor
public class TrackingController {

    @GetMapping("/{appointmentId}")
    public ResponseEntity<?> trackAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(Map.of("message", "Tracking feature coming soon"));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Object>> getAppointmentHistory() {
        return ResponseEntity.ok(List.of());
    }
}

