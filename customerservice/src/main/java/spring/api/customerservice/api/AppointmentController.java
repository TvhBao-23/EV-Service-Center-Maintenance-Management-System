package spring.api.customerservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.customerservice.api.dto.AppointmentCreateDto;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.Customer;
import spring.api.customerservice.domain.User;
import spring.api.customerservice.repository.AppointmentRepository;
import spring.api.customerservice.repository.CustomerRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<?> getMyAppointments(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Appointment> appointments = appointmentRepository
                .findByCustomerIdOrderByAppointmentDateDesc(customer.getCustomerId());

        return ResponseEntity.ok(appointments);
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentCreateDto dto, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        User user = (User) auth.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Appointment appointment = new Appointment();
        appointment.setCustomerId(customer.getCustomerId());
        appointment.setVehicleId(dto.getVehicleId());
        appointment.setServiceId(dto.getServiceId());
        appointment.setCenterId(dto.getCenterId());
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setStatus("PENDING");
        appointment.setNotes(dto.getNotes());

        Appointment saved = appointmentRepository.save(appointment);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đặt lịch thành công");
        response.put("appointment", saved);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(@PathVariable Long id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getCustomerId().equals(customer.getCustomerId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền truy cập"));
        }

        return ResponseEntity.ok(appointment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Customer customer = customerRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getCustomerId().equals(customer.getCustomerId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền truy cập"));
        }

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(Map.of("message", "Hủy lịch thành công"));
    }
}

