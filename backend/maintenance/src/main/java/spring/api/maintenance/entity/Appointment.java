package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity cho bảng appointments
 * Quản lý lịch hẹn dịch vụ từ khách hàng
 */
@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Integer appointmentId;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @Column(name = "service_id")
    private Integer serviceId;

    @Column(name = "requested_date_time", nullable = false)
    private LocalDateTime requestedDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AppointmentStatus {
        PENDING("Chờ xác nhận"),
        CONFIRMED("Đã xác nhận"),
        CANCELLED("Đã hủy"),
        COMPLETED("Hoàn thành");

        private final String description;

        AppointmentStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        // Helper method để convert từ database value
        public static AppointmentStatus fromString(String value) {
            if (value == null) return PENDING;
            
            switch (value.toLowerCase()) {
                case "pending":
                    return PENDING;
                case "confirmed":
                    return CONFIRMED;
                case "cancelled":
                    return CANCELLED;
                case "completed":
                    return COMPLETED;
                default:
                    return PENDING;
            }
        }
    }
}