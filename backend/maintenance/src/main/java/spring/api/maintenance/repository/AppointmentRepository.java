package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    // Find appointments by customer ID
    List<Appointment> findByCustomerId(Integer customerId);

    // Find appointments by vehicle ID
    List<Appointment> findByVehicleId(Integer vehicleId);

    // Find appointments by service ID
    List<Appointment> findByServiceId(Integer serviceId);

    // Find appointments by status
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);

    // Find appointments by date range
    List<Appointment> findByRequestedDateTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find appointments by customer and status
    List<Appointment> findByCustomerIdAndStatus(Integer customerId, Appointment.AppointmentStatus status);

    // Find appointments by vehicle and status
    List<Appointment> findByVehicleIdAndStatus(Integer vehicleId, Appointment.AppointmentStatus status);

    // Find upcoming appointments
    @Query("SELECT a FROM Appointment a WHERE a.requestedDateTime >= :currentTime AND a.status = 'CONFIRMED'")
    List<Appointment> findUpcomingAppointments(@Param("currentTime") LocalDateTime currentTime);

    // Find appointments for today
    @Query("SELECT a FROM Appointment a WHERE DATE(a.requestedDateTime) = DATE(:currentDate)")
    List<Appointment> findAppointmentsForToday(@Param("currentDate") LocalDateTime currentDate);

    // Find appointments by customer with details
    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.vehicle LEFT JOIN FETCH a.service WHERE a.customerId = :customerId")
    List<Appointment> findByCustomerIdWithDetails(@Param("customerId") Integer customerId);

    // Find appointment with all details
    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.customer LEFT JOIN FETCH a.vehicle LEFT JOIN FETCH a.service WHERE a.appointmentId = :appointmentId")
    Optional<Appointment> findByIdWithDetails(@Param("appointmentId") Integer appointmentId);

    // Count appointments by status
    long countByStatus(Appointment.AppointmentStatus status);

    // Count appointments by customer
    long countByCustomerId(Integer customerId);

    // Count appointments by vehicle
    long countByVehicleId(Integer vehicleId);
}
