package org.example.partsinventoryservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "parts")
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long partId;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    private double price;

    @OneToOne(mappedBy = "part", cascade = CascadeType.ALL)
    private PartInventory inventory;

    // Getters & Setters
    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public PartInventory getInventory() {
        return inventory;
    }

    public void setInventory(PartInventory inventory) {
        this.inventory = inventory;
    }
}
