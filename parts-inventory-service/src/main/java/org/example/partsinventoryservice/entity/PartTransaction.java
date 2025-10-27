package org.example.partsinventoryservice.entity;

import jakarta.persistence.*;
import org.example.partsinventoryservice.entity.enum_.TransactionType;

import java.time.LocalDateTime;

@Entity
@Table(name = "part_transactions")
public class PartTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "part_id")
    private Part part;

    @Enumerated(EnumType.STRING)
    private TransactionType type; // IMPORT / EXPORT

    private int quantity;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String performedBy; // người thực hiện (admin hoặc technician)

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Part getPart() { return part; }
    public void setPart(Part part) { this.part = part; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
