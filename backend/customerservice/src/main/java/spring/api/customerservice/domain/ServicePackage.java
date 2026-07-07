package spring.api.customerservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "service_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServicePackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long packageId;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(nullable = false)
    private Integer durationMonths; // Duration in months (3, 6, 12)
    
    @Column(nullable = false)
    private Integer servicesIncluded; // Number of services included
    
    @Column(columnDefinition = "TEXT")
    private String benefits; // JSON or comma-separated benefits
    
    @Column(nullable = false)
    private Boolean active = true;
}

