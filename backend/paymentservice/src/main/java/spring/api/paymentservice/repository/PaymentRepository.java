package spring.api.paymentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import spring.api.paymentservice.domain.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByAppointmentId(Long appointmentId);
    List<Payment> findByStatus(String status);

    @Query(value = "SELECT customer_id FROM customers WHERE user_id = :userId", nativeQuery = true)
    Optional<Long> findCustomerIdByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT customer_id FROM appointments WHERE appointment_id = :appointmentId", nativeQuery = true)
    Optional<Long> findCustomerIdByAppointmentId(@Param("appointmentId") Long appointmentId);
}

