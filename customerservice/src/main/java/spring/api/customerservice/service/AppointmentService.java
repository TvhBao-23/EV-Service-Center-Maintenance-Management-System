package spring.api.customerservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.AppointmentStatus;
import spring.api.customerservice.repository.AppointmentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public Appointment createAppointment(Long customerId, Long vehicleId, Long serviceId, Long centerId, LocalDateTime appointmentDate, String notes) {
        Appointment appointment = new Appointment();
        appointment.setCustomerId(customerId);
        appointment.setVehicleId(vehicleId);
        appointment.setServiceId(serviceId);
        appointment.setCenterId(centerId);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setNotes(notes);
        appointment.setStatus(AppointmentStatus.pending); // Default status
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByCustomerId(Long customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public Optional<Appointment> getAppointmentByIdAndCustomerId(Long appointmentId, Long customerId) {
        return appointmentRepository.findByAppointmentIdAndCustomerId(appointmentId, customerId);
    }

    public void cancelAppointment(Long appointmentId, Long customerId) {
        Appointment appointment = appointmentRepository.findByAppointmentIdAndCustomerId(appointmentId, customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch đặt hoặc bạn không có quyền hủy."));
        if (appointment.getStatus() == AppointmentStatus.pending) {
            appointment.setStatus(AppointmentStatus.cancelled);
            appointmentRepository.save(appointment);
        } else {
            throw new RuntimeException("Không thể hủy lịch đặt ở trạng thái hiện tại.");
        }
    }

    public List<Appointment> getAppointmentHistoryByCustomerId(Long customerId) {
        // For history, we might want to include COMPLETED and CANCELLED appointments
        return appointmentRepository.findByCustomerIdAndStatusIn(customerId, List.of(AppointmentStatus.completed, AppointmentStatus.cancelled));
    }
}
