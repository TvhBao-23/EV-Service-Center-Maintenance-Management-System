package spring.api.evservicecenter.entity;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "service_records")
public class ServiceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private BigDecimal cost; // Chi phí
    private LocalDate serviceDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    // Getters and Setters...
    public BigDecimal getCost() { return cost; }
    public Vehicle getVehicle() { return vehicle; }
}
