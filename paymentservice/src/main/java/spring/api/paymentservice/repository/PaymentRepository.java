package spring.api.paymentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.paymentservice.domain.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByAppointmentId(Long appointmentId);
    List<Payment> findByStatus(String status);
}

