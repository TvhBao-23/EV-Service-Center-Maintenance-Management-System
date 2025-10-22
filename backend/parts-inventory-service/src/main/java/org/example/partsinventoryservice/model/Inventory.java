package org.example.partsinventoryservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;

    @OneToOne
    @JoinColumn(name = "part_id", nullable = false, unique = true)
    private Part part;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "min_threshold", nullable = false)
    private int minThreshold = 0;

    @Column(name = "max_threshold")
    private int maxThreshold = 100;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        lastUpdated = LocalDateTime.now();
    }
}