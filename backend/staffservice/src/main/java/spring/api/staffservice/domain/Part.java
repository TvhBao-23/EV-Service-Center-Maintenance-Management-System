package spring.api.staffservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Part {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id")
    private Long partId;

    @Column(name = "part_code", unique = true, nullable = false, length = 50)
    private String partCode;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category; // battery, motor, brake, tire, electronic, charging, cooling, etc.

    @Column(length = 100)
    private String manufacturer;

    @Column(name = "compatible_models", columnDefinition = "TEXT")
    private String compatibleModels; // JSON array

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "min_stock_level", nullable = false)
    private Integer minStockLevel = 5;

    @Column(length = 100)
    private String location; // Vị trí trong kho

    @Column(name = "warranty_months")
    private Integer warrantyMonths = 12;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PartStatus status = PartStatus.available;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        updateStockStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateStockStatus();
    }

    private void updateStockStatus() {
        if (stockQuantity == 0) {
            status = PartStatus.out_of_stock;
        } else if (stockQuantity <= minStockLevel) {
            status = PartStatus.low_stock;
        } else if (status != PartStatus.discontinued) {
            status = PartStatus.available;
        }
    }

    public enum PartStatus {
        available,
        low_stock,
        out_of_stock,
        discontinued
    }
}

