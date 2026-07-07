package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.ServiceReceipt;

import java.util.Optional;
import java.util.List;

@Repository
public interface ServiceReceiptRepository extends JpaRepository<ServiceReceipt, Long> {
    Optional<ServiceReceipt> findByAppointmentId(Long appointmentId);
    Optional<ServiceReceipt> findByReceiptNumber(String receiptNumber);
    List<ServiceReceipt> findByVehicleId(Long vehicleId);
    List<ServiceReceipt> findAllByOrderByCreatedAtDesc();
}

