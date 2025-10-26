package spring.api.evservicecenter.adminworkshop.entity;

import jakarta.persistence.*;

import lombok.Getter; // <-- Import
import lombok.Setter; // <-- Import
import spring.api.evservicecenter.adminworkshop.enums.PaymentStatus;
import spring.api.evservicecenter.adminworkshop.enums.ServiceOrderStatus;

// Import enum payment status
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_orders")
@Getter // <-- Thêm annotation này
@Setter // <-- Thêm annotation này
public class ServiceOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "decimal_total_price")
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ServiceOrderStatus status; // Đảm bảo đúng tên và kiểu

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus; // Giả sử bạn có enum này

    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // Đảm bảo có trường này

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private Staff assignedTechnician;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", unique = true)
    private Appointment appointment; // Giả sử bạn có entity Appointment

    // (Thêm các mối quan hệ khác như @OneToMany cho order_items, payments, service_checklists nếu cần)

     // Logic tự set thời gian tạo
    @PrePersist
    protected void onCreate() {
         createdAt = LocalDateTime.now();
    }

    

    // ... các trường khác (status, check_in_time) và getters/setters
}
