package com.rajpipes.billing.dto;

import java.math.BigDecimal;

import com.rajpipes.billing.entity.Product;

public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String unit;
    private BigDecimal price;
    private Integer stockQty;
    private boolean active;

    public static ProductResponse from(Product product) {
        ProductResponse response = new ProductResponse();
        response.id = product.getId();
        response.name = product.getName();
        response.sku = product.getSku();
        response.unit = product.getUnit();
        response.price = product.getPrice();
        response.stockQty = product.getStockQty();
        response.active = product.isActive();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public String getUnit() {
        return unit;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getStockQty() {
        return stockQty;
    }

    public boolean isActive() {
        return active;
    }
}
