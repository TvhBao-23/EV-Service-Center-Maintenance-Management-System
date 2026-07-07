package org.example.partsinventoryservice.dto;

import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;

import java.time.LocalDateTime;

public class TransactionDto {

    private Long txnId;
    private Long partId;
    private String partCode;
    private String partName;
    private TransactionType type;
    private Integer quantity;
    private Long relatedRequestId;
    private Long relatedOrderId;
    private String note;
    private Long createdByStaffId;
    private LocalDateTime createdAt;

    public TransactionDto() {}

    public TransactionDto(PartTransaction txn) {
        this.txnId = txn.getTxnId();
        this.partId = txn.getPart().getPartId();
        this.partCode = txn.getPart().getPartCode();
        this.partName = txn.getPart().getName();
        this.type = txn.getType();
        this.quantity = txn.getQuantity();
        this.relatedRequestId = txn.getRelatedRequestId();
        this.relatedOrderId = txn.getRelatedOrderId();
        this.note = txn.getNote();
        this.createdByStaffId = txn.getCreatedByStaffId();
        this.createdAt = txn.getCreatedAt();
    }

    // Getters and Setters
    public Long getTxnId() { return txnId; }
    public void setTxnId(Long txnId) { this.txnId = txnId; }

    public Long getPartId() { return partId; }
    public void setPartId(Long partId) { this.partId = partId; }

    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getRelatedRequestId() { return relatedRequestId; }
    public void setRelatedRequestId(Long relatedRequestId) { this.relatedRequestId = relatedRequestId; }

    public Long getRelatedOrderId() { return relatedOrderId; }
    public void setRelatedOrderId(Long relatedOrderId) { this.relatedOrderId = relatedOrderId; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Long getCreatedByStaffId() { return createdByStaffId; }
    public void setCreatedByStaffId(Long createdByStaffId) { this.createdByStaffId = createdByStaffId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
