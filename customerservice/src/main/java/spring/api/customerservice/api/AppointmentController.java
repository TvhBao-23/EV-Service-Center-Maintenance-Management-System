package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    @GetMapping
    public ResponseEntity<List<Object>> getMyAppointments() {
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Object dto) {
        return ResponseEntity.ok(Map.of("message", "Appointment feature coming soon"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "Appointment feature coming soon"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "Appointment feature coming soon"));
    }
}

