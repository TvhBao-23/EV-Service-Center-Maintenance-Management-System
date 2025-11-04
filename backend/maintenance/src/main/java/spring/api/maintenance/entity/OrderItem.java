package spring.api.maintenance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Entity cho bảng order_items
 * Quản lý các hạng mục trong phiếu bảo dưỡng (dịch vụ và phụ tùng)
 */
@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Integer itemId;

    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @Column(name = "service_id")
    private Integer serviceId;

    @Column(name = "part_id")
    private Integer partId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Convert(converter = ItemTypeConverter.class)
    @Column(name = "type", length = 20)
    private ItemType type;

    public enum ItemType {
        SERVICE("Dịch vụ"),
        PART("Phụ tùng");

        private final String description;

        ItemType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }

        // Helper method để convert từ database value
        public static ItemType fromString(String value) {
            if (value == null) return SERVICE;
            
            switch (value.toLowerCase()) {
                case "service":
                    return SERVICE;
                case "part":
                    return PART;
                default:
                    return SERVICE;
            }
        }
    }

    @PrePersist
    @PreUpdate
    protected void calculateTotalPrice() {
        if (unitPrice != null && quantity != null) {
            totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}