package org.example.partsinventoryservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "part_inventory")
public class PartInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @Column(nullable = false)
    private int currentStock;

    @Column(nullable = false)
    private int minStock;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Part getPart() { return part; }
    public void setPart(Part part) { this.part = part; }

    public int getCurrentStock() { return currentStock; }
    public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }

    public int getMinStock() { return minStock; }
    public void setMinStock(int minStock) { this.minStock = minStock; }
}
