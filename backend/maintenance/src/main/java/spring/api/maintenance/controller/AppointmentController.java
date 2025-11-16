package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import spring.api.maintenance.entity.Appointment;
import spring.api.maintenance.entity.ServiceOrder;
import spring.api.maintenance.service.AppointmentService;
import spring.api.maintenance.service.ServiceOrderService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/appointments")
// CORS is handled by API Gateway
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private ServiceOrderService serviceOrderService;

    // Tạo lịch hẹn mới
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        try {
            Appointment createdAppointment = appointmentService.createAppointment(appointment);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAppointment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Lấy lịch hẹn theo ID
    @GetMapping("/{appointmentId}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Integer appointmentId) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(appointmentId);
        return appointment.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy danh sách lịch hẹn của khách hàng
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByCustomer(@PathVariable Integer customerId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByCustomer(customerId);
        return ResponseEntity.ok(appointments);
    }

    // Lấy tất cả lịch hẹn
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    // Xác nhận lịch hẹn
    @PutMapping("/{appointmentId}/confirm")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable Integer appointmentId) {
        try {
            Appointment appointment = appointmentService.confirmAppointment(appointmentId);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Hủy lịch hẹn
    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Integer appointmentId) {
        try {
            Appointment appointment = appointmentService.cancelAppointment(appointmentId);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Cập nhật lịch hẹn
    @PutMapping("/{appointmentId}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Integer appointmentId, 
                                                        @RequestBody Appointment appointment) {
        try {
            Appointment updatedAppointment = appointmentService.updateAppointment(appointmentId, appointment);
            return ResponseEntity.ok(updatedAppointment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Hoàn thành lịch hẹn
    @PutMapping("/{appointmentId}/complete")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Integer appointmentId) {
        try {
            Appointment appointment = appointmentService.completeAppointment(appointmentId);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Lấy lịch hẹn theo trạng thái
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable String status) {
        List<Appointment> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    // Tiếp nhận lịch hẹn và tạo phiếu bảo dưỡng
    @PutMapping("/{appointmentId}/receive")
    public ResponseEntity<?> receiveAppointment(@PathVariable Integer appointmentId) {
        try {
            // 1. Chuyển appointment status từ CONFIRMED → RECEIVED
            Appointment appointment = appointmentService.receiveAppointment(appointmentId);
            
            // 2. Tạo service order từ appointment
            ServiceOrder serviceOrder = serviceOrderService.createServiceOrderFromAppointment(appointmentId);
            
            if (serviceOrder == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Không thể tạo phiếu bảo dưỡng từ appointment này");
            }
            
            // 3. Trả về cả appointment và service order
            Map<String, Object> response = new HashMap<>();
            response.put("appointment", appointment);
            response.put("serviceOrder", serviceOrder);
            response.put("message", "Đã tiếp nhận lịch hẹn và tạo phiếu bảo dưỡng thành công");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tiếp nhận appointment: " + e.getMessage());
        }
    }
}