package spring.api.staffservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.staffservice.domain.Appointment;
import spring.api.staffservice.repository.AppointmentRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    private final AppointmentRepository appointmentRepository;

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments(Authentication auth) {
        List<Appointment> appointments = appointmentRepository.findAllByOrderByAppointmentDateDesc();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(
            @PathVariable String status,
            Authentication auth) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<Appointment> getAppointment(@PathVariable Long id, Authentication auth) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));
        return ResponseEntity.ok(appointment);
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));
        
        String newStatus = body.get("status");
        if (newStatus != null) {
            appointment.setStatus(newStatus);
            appointmentRepository.save(appointment);
        }
        
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công", "appointment", appointment));
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates,
            Authentication auth) {
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));
        
        if (updates.containsKey("notes")) {
            appointment.setNotes((String) updates.get("notes"));
        }
        
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }
}

