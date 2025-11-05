package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_part_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServicePartCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mapping_id")
    private Long mappingId;
    
    @Column(name = "service_category", nullable = false, length = 50)
    private String serviceCategory;
    
    @Column(name = "part_category", nullable = false, length = 100)
    private String partCategory;
    
    @Column(nullable = false)
    private Integer priority = 1;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

