package org.example.partsinventoryservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "part_request_items")
public class PartRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_item_id")
    private Long requestItemId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private PartRequest request;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @Column(name = "quantity_requested", nullable = false)
    private Integer quantityRequested;

    @Column(name = "quantity_approved", nullable = false)
    private Integer quantityApproved = 0;

    // Getters/Setters
    public Long getRequestItemId() { return requestItemId; }
    public void setRequestItemId(Long requestItemId) { this.requestItemId = requestItemId; }

    public PartRequest getRequest() { return request; }
    public void setRequest(PartRequest request) { this.request = request; }

    public Part getPart() { return part; }
    public void setPart(Part part) { this.part = part; }

    public Integer getQuantityRequested() { return quantityRequested; }
    public void setQuantityRequested(Integer quantityRequested) { this.quantityRequested = quantityRequested; }

    public Integer getQuantityApproved() { return quantityApproved; }
    public void setQuantityApproved(Integer quantityApproved) { this.quantityApproved = quantityApproved; }
}
