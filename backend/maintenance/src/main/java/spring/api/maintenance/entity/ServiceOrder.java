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

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

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
        DELAYED("Bị trễ");

        private final String description;

        ServiceOrderStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        // Helper method để convert từ database value
        public static ServiceOrderStatus fromString(String value) {
            if (value == null) return QUEUED;
            
            switch (value.toLowerCase()) {
                case "queued":
                    return QUEUED;
                case "in_progress":
                    return IN_PROGRESS;
                case "completed":
                    return COMPLETED;
                case "delayed":
                    return DELAYED;
                default:
                    return QUEUED;
            }
        }
    }

    public enum PaymentStatus {
        UNPAID("Chờ thanh toán"),
        PAID("Đã thanh toán"),
        PARTIALLY_PAID("Thanh toán một phần");

        private final String description;

        PaymentStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        // Helper method để convert từ database value
        public static PaymentStatus fromString(String value) {
            if (value == null) return UNPAID;
            
            switch (value.toLowerCase()) {
                case "unpaid":
                    return UNPAID;
                case "paid":
                    return PAID;
                case "partially_paid":
                case "partial":
                    return PARTIALLY_PAID;
                default:
                    return UNPAID;
            }
        }
    }
}