package spring.api.customerservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.AppointmentStatus;
import spring.api.customerservice.repository.AppointmentRepository;
import spring.api.customerservice.repository.PaymentRepository;
import spring.api.customerservice.repository.ServiceRepository;
import spring.api.customerservice.domain.Payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final ServiceRepository serviceRepository;

    public Appointment createAppointment(Long customerId, Long vehicleId, Long serviceId, Long centerId,
            LocalDateTime appointmentDate, String notes) {
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
        return appointmentRepository.findByCustomerIdAndStatusIn(customerId,
                List.of(AppointmentStatus.completed, AppointmentStatus.cancelled));
    }

    public boolean isAppointmentPaid(Long appointmentId) {
        return paymentRepository.existsByAppointmentIdAndStatus(appointmentId, Payment.PaymentStatus.completed);
    }

    /**
     * Get service price from database by serviceId
     * Throws exception if service not found or price is invalid
     */
    private java.math.BigDecimal getServicePrice(Long serviceId) {
        if (serviceId == null) {
            throw new RuntimeException("Service ID cannot be null");
        }

        try {
            Optional<spring.api.customerservice.domain.Service> serviceOpt = serviceRepository.findById(serviceId);
            if (serviceOpt.isEmpty()) {
                throw new RuntimeException("Service not found for serviceId: " + serviceId);
            }

            spring.api.customerservice.domain.Service service = serviceOpt.get();
            java.math.BigDecimal price = service.getBasePrice();

            if (price == null) {
                throw new RuntimeException("Service price is null for serviceId: " + serviceId +
                        ", service name: " + service.getName());
            }

            if (price.compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Service price must be greater than 0 for serviceId: " + serviceId +
                        ", current price: " + price);
            }

            System.out.println("[AppointmentService] Found service ID: " + serviceId +
                    ", name: " + service.getName() +
                    ", price: " + price);
            return price;
        } catch (RuntimeException e) {
            // Re-throw RuntimeException as-is
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching service price for serviceId: " + serviceId +
                    ", error: " + e.getMessage(), e);
        }
    }

    public Appointment markAppointmentAsPaid(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch đặt"));

        // Check if payment already exists for this appointment
        if (isAppointmentPaid(appointmentId)) {
            System.out.println("[AppointmentService] Payment already exists for appointment: " + appointmentId);
            appointment.setStatus(AppointmentStatus.completed);
            return appointmentRepository.save(appointment);
        }

        // Get service price from database
        java.math.BigDecimal servicePrice = getServicePrice(appointment.getServiceId());
        System.out.println("[AppointmentService] Creating payment for appointment: " + appointmentId +
                ", serviceId: " + appointment.getServiceId() +
                ", amount: " + servicePrice);

        // Create payment record with correct amount from database
        Payment payment = new Payment();
        payment.setAppointmentId(appointmentId);
        payment.setCustomerId(appointment.getCustomerId());
        payment.setAmount(servicePrice); // Use actual service price from database
        payment.setStatus(Payment.PaymentStatus.completed);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(Payment.PaymentMethod.e_wallet);
        payment.setTransactionId("QUICK_PAY_" + appointmentId + "_" + System.currentTimeMillis());
        payment.setNotes("Thanh toán cho lịch đặt dịch vụ #" + appointmentId);
        paymentRepository.save(payment);

        System.out.println("[AppointmentService] ✅ Created payment ID: " + payment.getPaymentId() +
                " with amount: " + payment.getAmount());

        // Update appointment status to completed
        appointment.setStatus(AppointmentStatus.completed);
        return appointmentRepository.save(appointment);
    }
}
