package spring.api.customerservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import spring.api.customerservice.domain.Appointment;
import spring.api.customerservice.domain.AppointmentStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByCustomerId(Long customerId);
    
    Optional<Appointment> findByAppointmentIdAndCustomerId(Long appointmentId, Long customerId);
    
    List<Appointment> findByCustomerIdAndStatusIn(Long customerId, List<AppointmentStatus> statuses);
    
    @Query("SELECT a FROM Appointment a WHERE a.customerId = :customerId ORDER BY a.appointmentDate DESC")
    List<Appointment> findByCustomerIdOrderByAppointmentDateDesc(@Param("customerId") Long customerId);
}