package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.repository.CustomerRepository;
import spring.api.customerservice.service.AppointmentService;

import java.util.List;

@RestController
@RequestMapping("/api/customers/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final AppointmentService appointmentService;
    private final CustomerRepository customerRepository;

    @GetMapping("/{appointmentId}")
    public ResponseEntity<?> trackAppointment(Authentication auth, @PathVariable Long appointmentId) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();
        try {
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            return appointmentService.getAppointmentByIdAndCustomerId(appointmentId, customer.getCustomerId())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error tracking appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Appointment>> getAppointmentHistory(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();
        try {
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            List<Appointment> appointments = appointmentService.getAppointmentHistoryByCustomerId(customer.getCustomerId());
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("Error fetching appointment history: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
}