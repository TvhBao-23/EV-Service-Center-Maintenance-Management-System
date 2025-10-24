package org.example.partsinventoryservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "part_inventories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"part_id"}))
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
    @JoinColumn(name = "part_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_inventory_part"))
    private Part part;

    @Column(name = "quantity_in_stock", nullable = false)
    private int quantityInStock = 0;

    @Column(name = "min_stock_level", nullable = false)
    private int minStockLevel = 5;
}
