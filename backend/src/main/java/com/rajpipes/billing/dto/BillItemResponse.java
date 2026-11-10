package com.rajpipes.billing.dto;

import java.math.BigDecimal;

import com.rajpipes.billing.entity.BillItem;

public class BillItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String unit;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;

    public static BillItemResponse from(BillItem item) {
        BillItemResponse response = new BillItemResponse();
        response.id = item.getId();
        response.productId = item.getProduct() != null ? item.getProduct().getId() : null;
        response.productName = item.getProductName();
        response.unit = item.getProduct() != null && item.getProduct().getUnit() != null ? item.getProduct().getUnit() : "pcs";
        response.unitPrice = item.getUnitPrice();
        response.quantity = item.getQuantity();
        response.lineTotal = item.getLineTotal();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getUnit() {
        return unit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }
}
