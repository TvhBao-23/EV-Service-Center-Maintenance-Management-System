package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.repository.AppointmentRepository;
import spring.api.customerservice.repository.CustomerRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;

    @GetMapping("/{appointmentId}")
    public ResponseEntity<?> trackAppointment(@PathVariable Long appointmentId, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getCustomerId().equals(customer.getCustomerId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền truy cập"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("appointmentId", appointment.getAppointmentId());
        response.put("status", appointment.getStatus());
        response.put("appointmentDate", appointment.getAppointmentDate());
        response.put("notes", appointment.getNotes());
        response.put("createdAt", appointment.getCreatedAt());
        response.put("updatedAt", appointment.getUpdatedAt());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getAppointmentHistory(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return ResponseEntity.ok(appointmentRepository.findByCustomerIdOrderByAppointmentDateDesc(customer.getCustomerId()));
    }
}

