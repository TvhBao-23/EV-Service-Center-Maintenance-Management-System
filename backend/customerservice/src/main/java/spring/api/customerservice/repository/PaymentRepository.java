package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.customerservice.domain.Payment;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByAppointmentIdAndStatus(Long appointmentId, Payment.PaymentStatus status);
    List<Payment> findByCustomerIdAndStatus(Long customerId, Payment.PaymentStatus status);
    List<Payment> findBySubscriptionId(Long subscriptionId);
}
