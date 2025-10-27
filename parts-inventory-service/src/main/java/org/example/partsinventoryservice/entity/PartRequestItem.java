package org.example.partsinventoryservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "part_request_items")
public class PartRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private PartRequest partRequest;

    @ManyToOne
    @JoinColumn(name = "part_id")
    private Part part;

    private int quantityRequested;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PartRequest getPartRequest() { return partRequest; }
    public void setPartRequest(PartRequest partRequest) { this.partRequest = partRequest; }

    public Part getPart() { return part; }
    public void setPart(Part part) { this.part = part; }

    public int getQuantityRequested() { return quantityRequested; }
    public void setQuantityRequested(int quantityRequested) { this.quantityRequested = quantityRequested; }
}
