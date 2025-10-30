package spring.api.customerservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.AppointmentStatus;
import spring.api.customerservice.repository.AppointmentRepository;
import spring.api.customerservice.repository.PaymentRepository;
import spring.api.customerservice.domain.Payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;

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

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
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

    public boolean isAppointmentPaid(Long appointmentId) {
        return paymentRepository.existsByAppointmentIdAndStatus(appointmentId, Payment.PaymentStatus.completed);
    }
    
    public Appointment markAppointmentAsPaid(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch đặt"));
        
        // Create payment record
        Payment payment = new Payment();
        payment.setAppointmentId(appointmentId);
        payment.setCustomerId(appointment.getCustomerId());
        payment.setAmount(new java.math.BigDecimal("0")); // Default amount, should be calculated
        payment.setStatus(Payment.PaymentStatus.completed);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(Payment.PaymentMethod.e_wallet); // Use enum value
        payment.setTransactionId("QUICK_PAY_" + System.currentTimeMillis());
        paymentRepository.save(payment);
        
        // Update appointment status to completed or paid
        appointment.setStatus(AppointmentStatus.completed);
        return appointmentRepository.save(appointment);
    }
}
