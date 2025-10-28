package org.example.partsinventoryservice.dto;

import java.math.BigDecimal;

public class InventoryResponseDto {
    private Long partId;
    private String name;
    private Integer quantityInStock;
    private Integer minStockLevel;
    private BigDecimal unitPrice;

    public InventoryResponseDto(Long partId, String name, Integer quantityInStock, Integer minStockLevel, BigDecimal unitPrice) {
        this.partId = partId;
        this.name = name;
        this.quantityInStock = quantityInStock;
        this.minStockLevel = minStockLevel;
        this.unitPrice = unitPrice;
    }

    // Getters
    public Long getPartId() { return partId; }
    public String getName() { return name; }
    public Integer getQuantityInStock() { return quantityInStock; }
    public Integer getMinStockLevel() { return minStockLevel; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}

