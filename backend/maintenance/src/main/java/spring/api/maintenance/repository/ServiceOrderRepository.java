package spring.api.maintenance.repository;

import spring.api.maintenance.entity.ServiceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {

    // Find service orders by vehicle ID
    List<ServiceOrder> findByVehicleId(Long vehicleId);

    // Find service orders by technician ID
    List<ServiceOrder> findByAssignedTechnicianId(Long technicianId);

    // Find service orders by status
    List<ServiceOrder> findByStatus(ServiceOrder.ServiceOrderStatus status);

    // Find service orders by payment status
    List<ServiceOrder> findByPaymentStatus(ServiceOrder.PaymentStatus paymentStatus);

    // Find service orders by appointment ID
    Optional<ServiceOrder> findByAppointmentId(Long appointmentId);

    // Find service orders by date range
    List<ServiceOrder> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find service orders by total amount range
    List<ServiceOrder> findByTotalAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);

    // Find active service orders (not completed)
    @Query("SELECT so FROM ServiceOrder so WHERE so.status IN ('QUEUED', 'IN_PROGRESS', 'DELAYED')")
    List<ServiceOrder> findActiveServiceOrders();

    // Find completed service orders
    @Query("SELECT so FROM ServiceOrder so WHERE so.status = 'COMPLETED'")
    List<ServiceOrder> findCompletedServiceOrders();

    // Find service orders by technician and status
    List<ServiceOrder> findByAssignedTechnicianIdAndStatus(Long technicianId, ServiceOrder.ServiceOrderStatus status);

    // Find unpaid service orders
    @Query("SELECT so FROM ServiceOrder so WHERE so.paymentStatus IN ('UNPAID', 'PARTIALLY_PAID')")
    List<ServiceOrder> findUnpaidServiceOrders();

    // Find service orders with details
    @Query("SELECT so FROM ServiceOrder so LEFT JOIN FETCH so.vehicle LEFT JOIN FETCH so.appointment WHERE so.orderId = :orderId")
    Optional<ServiceOrder> findByIdWithDetails(@Param("orderId") Long orderId);

    // Find service orders by vehicle with details
    @Query("SELECT so FROM ServiceOrder so LEFT JOIN FETCH so.vehicle LEFT JOIN FETCH so.appointment WHERE so.vehicleId = :vehicleId")
    List<ServiceOrder> findByVehicleIdWithDetails(@Param("vehicleId") Long vehicleId);

    // Count service orders by status
    long countByStatus(ServiceOrder.ServiceOrderStatus status);

    // Count service orders by technician
    long countByAssignedTechnicianId(Long technicianId);

    // Count service orders by payment status
    long countByPaymentStatus(ServiceOrder.PaymentStatus paymentStatus);

    // Calculate total revenue
    @Query("SELECT SUM(so.totalAmount) FROM ServiceOrder so WHERE so.paymentStatus = 'PAID'")
    BigDecimal calculateTotalRevenue();

    // Calculate revenue by date range
    @Query("SELECT SUM(so.totalAmount) FROM ServiceOrder so WHERE so.paymentStatus = 'PAID' AND so.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
