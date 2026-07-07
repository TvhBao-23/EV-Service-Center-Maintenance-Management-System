package spring.api.maintenance.repository;

import spring.api.maintenance.entity.ServiceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository cho ServiceOrder entity
 */
@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Integer> {

    /**
     * Tìm phiếu bảo dưỡng theo appointment
     */
    Optional<ServiceOrder> findByAppointmentId(Integer appointmentId);

    /**
     * Tìm phiếu bảo dưỡng theo xe
     */
    List<ServiceOrder> findByVehicleId(Integer vehicleId);

    /**
     * Tìm phiếu bảo dưỡng theo kỹ thuật viên
     */
    List<ServiceOrder> findByAssignedTechnicianId(Integer technicianId);

    /**
     * Tìm phiếu bảo dưỡng theo trạng thái
     */
    List<ServiceOrder> findByStatus(ServiceOrder.ServiceOrderStatus status);

    /**
     * Tìm phiếu bảo dưỡng theo trạng thái thanh toán
     */
    List<ServiceOrder> findByPaymentStatus(ServiceOrder.PaymentStatus paymentStatus);

    /**
     * Tìm phiếu bảo dưỡng đã hoàn thành
     */
    @Query("SELECT so FROM ServiceOrder so WHERE so.status = 'COMPLETED'")
    List<ServiceOrder> findCompletedServiceOrders();

    /**
     * Tìm phiếu bảo dưỡng đang thực hiện
     */
    @Query("SELECT so FROM ServiceOrder so WHERE so.status = 'IN_PROGRESS'")
    List<ServiceOrder> findInProgressServiceOrders();

    /**
     * Tìm phiếu bảo dưỡng trong khoảng thời gian
     */
    @Query("SELECT so FROM ServiceOrder so WHERE so.createdAt BETWEEN :startDate AND :endDate")
    List<ServiceOrder> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Đếm phiếu bảo dưỡng theo trạng thái
     */
    long countByStatus(ServiceOrder.ServiceOrderStatus status);

    /**
     * Đếm phiếu bảo dưỡng theo kỹ thuật viên
     */
    long countByAssignedTechnicianId(Integer technicianId);
}