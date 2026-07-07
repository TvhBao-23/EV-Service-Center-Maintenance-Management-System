package org.example.partsinventoryservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "parts")
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id")
    private Long partId;

    @Column(name = "part_code", nullable = false, unique = true)
    private String partCode;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    private String manufacturer;

    @OneToOne(mappedBy = "part", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private PartInventory inventory;

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"part"})
    private List<PartTransaction> transactions = new ArrayList<>();

    // Khi set inventory mới, đồng bộ 2 chiều
    public void setInventory(PartInventory inventory) {
        if (inventory != null) {
            inventory.setPart(this);
        }
        this.inventory = inventory;
    }

    // Getters/Setters còn lại
    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }

    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public PartInventory getInventory() { return inventory; }

    public List<PartTransaction> getTransactions() { return transactions; }
    public void setTransactions(List<PartTransaction> transactions) {
        this.transactions = transactions;
        if (transactions != null) {
            transactions.forEach(txn -> txn.setPart(this));
        }
    }
}
