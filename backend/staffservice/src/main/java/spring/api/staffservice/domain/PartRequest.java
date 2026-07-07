package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "part_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "part_id", nullable = false)
    private Long partId;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 20)
    private RequestType requestType = RequestType.purchase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.pending;

    @Column(name = "requested_price", precision = 10, scale = 2)
    private BigDecimal requestedPrice;

    @Column(name = "approved_price", precision = 10, scale = 2)
    private BigDecimal approvedPrice;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(columnDefinition = "TEXT")
    private String notes; // Ghi chú từ khách hàng

    @Column(name = "staff_notes", columnDefinition = "TEXT")
    private String staffNotes; // Ghi chú từ staff

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", length = 20)
    private DeliveryMethod deliveryMethod = DeliveryMethod.pickup;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum RequestType {
        purchase,
        quote,
        warranty
    }

    public enum RequestStatus {
        pending,
        approved,
        rejected,
        fulfilled,
        cancelled
    }

    public enum DeliveryMethod {
        pickup,
        delivery
    }
}

