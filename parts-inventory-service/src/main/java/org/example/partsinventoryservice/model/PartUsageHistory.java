package org.example.partsinventoryservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "part_usage_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartUsageHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_id")
    private Long usageId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "part_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_usage_part"))
    private Part part;

    @Column(name = "quantity_used", nullable = false)
    private int quantityUsed;

    @Column(name = "used_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime usedAt = LocalDateTime.now();

    @Column(name = "vehicle_model", nullable = false, length = 100)
    private String vehicleModel;
}

