package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity cho bảng service_orders
 * Quản lý phiếu bảo dưỡng được tạo từ appointment
 */
@Entity
@Table(name = "service_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "appointment_id")
    private Integer appointmentId;

    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @Column(name = "assigned_technician_id")
    private Integer assignedTechnicianId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ServiceOrderStatus status = ServiceOrderStatus.QUEUED;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ServiceOrderStatus {
        QUEUED("Chờ xử lý"),
        IN_PROGRESS("Đang thực hiện"),
        COMPLETED("Hoàn thành"),
        DELAYED("Bị trễ"),
        CANCELLED("Đã hủy");

        private final String description;

        ServiceOrderStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum PaymentStatus {
        PENDING("Chờ thanh toán"),
        PAID("Đã thanh toán"),
        REFUNDED("Đã hoàn tiền"),
        PARTIAL("Thanh toán một phần");

        private final String description;

        PaymentStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}