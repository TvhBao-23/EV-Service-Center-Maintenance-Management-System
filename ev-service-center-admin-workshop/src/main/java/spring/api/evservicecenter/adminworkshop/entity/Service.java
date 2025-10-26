package spring.api.evservicecenter.adminworkshop.entity;

 // Đảm bảo đúng package

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
// Bạn có thể cần tạo Enum ServiceType
// import com.evservicecenter.enums.ServiceType;

@Entity
@Table(name = "services")
@Getter
@Setter
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Integer serviceId;

    @Column(name = "name", length = 100, nullable = false)
    private String name; // Đổi tên thành 'name' cho khớp schema

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "base_price", precision = 10, scale = 2, nullable = false, columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private BigDecimal basePrice;

    // Sử dụng Enum nếu bạn muốn an toàn kiểu dữ liệu
    // @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private String type; // Hoặc dùng Enum ServiceType

    @Column(name = "is_package", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isPackage = false;

    @Column(name = "validity_days")
    private Integer validityDays;

    // Optional: Mối quan hệ OneToMany ngược lại với Appointment
    // @OneToMany(mappedBy = "service", fetch = FetchType.LAZY)
    // private java.util.List<Appointment> appointments;

}