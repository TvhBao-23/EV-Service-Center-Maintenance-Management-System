package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.api.dto.AppointmentCreateDto;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.repository.CustomerRepository;
import spring.api.customerservice.service.AppointmentService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<List<Appointment>> getMyAppointments(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();
        try {
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            List<Appointment> appointments = appointmentService.getAppointmentsByCustomerId(customer.getCustomerId());
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("Error fetching appointments: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(Authentication auth, @RequestBody AppointmentCreateDto dto) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();

        try {
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

            Appointment appointment = appointmentService.createAppointment(
                    customer.getCustomerId(),
                    dto.getVehicleId(),
                    dto.getServiceId(),
                    dto.getCenterId(),
                    dto.getAppointmentDateAsLocalDateTime(),
                    dto.getNotes()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Đặt lịch thành công!",
                    "appointmentId", appointment.getAppointmentId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Error creating appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Có lỗi xảy ra khi đặt lịch"
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(Authentication auth, @PathVariable Long id) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();
        try {
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            Optional<Appointment> appointment = appointmentService.getAppointmentByIdAndCustomerId(id, customer.getCustomerId());
            return appointment.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error fetching appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(Authentication auth, @PathVariable Long id) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();
        try {
            Customer customer = customerRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
            appointmentService.cancelAppointment(id, customer.getCustomerId());
            return ResponseEntity.ok(Map.of("success", true, "message", "Hủy lịch thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error cancelling appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Có lỗi xảy ra"));
        }
    }
}