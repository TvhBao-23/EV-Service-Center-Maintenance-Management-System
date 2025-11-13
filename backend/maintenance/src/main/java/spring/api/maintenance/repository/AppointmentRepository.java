package spring.api.maintenance.repository;

import spring.api.maintenance.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho Appointment entity
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    /**
     * Tìm lịch hẹn theo khách hàng
     */
    List<Appointment> findByCustomerId(Integer customerId);

    /**
     * Tìm lịch hẹn theo xe
     */
    List<Appointment> findByVehicleId(Integer vehicleId);

    /**
     * Tìm lịch hẹn theo dịch vụ
     */
    List<Appointment> findByServiceId(Integer serviceId);

    /**
     * Tìm lịch hẹn theo trạng thái
     */
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);

    /**
     * Tìm lịch hẹn theo khách hàng và trạng thái
     */
    List<Appointment> findByCustomerIdAndStatus(Integer customerId, Appointment.AppointmentStatus status);

    /**
     * Tìm lịch hẹn theo xe và trạng thái
     */
    List<Appointment> findByVehicleIdAndStatus(Integer vehicleId, Appointment.AppointmentStatus status);

    /**
     * Tìm lịch hẹn trong khoảng thời gian
     */
    @Query("SELECT a FROM Appointment a WHERE a.requestedDateTime BETWEEN :startDate AND :endDate")
    List<Appointment> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Tìm lịch hẹn với thông tin chi tiết
     */
    @Query("SELECT a FROM Appointment a WHERE a.appointmentId = :id")
    Appointment findByIdWithDetails(@Param("id") Integer id);

    /**
     * Đếm lịch hẹn theo khách hàng
     */
    long countByCustomerId(Integer customerId);

    /**
     * Đếm lịch hẹn theo xe
     */
    long countByVehicleId(Integer vehicleId);
}