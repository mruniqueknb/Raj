package com.rajpipes.billing.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.rajpipes.billing.entity.Bill;
import com.rajpipes.billing.entity.BillStatus;

public class BillResponse {

    private Long id;
    private String billNumber;
    private String labourName;
    private String customerName;
    private String customerPhone;
    private BillStatus status;
    private BigDecimal totalAmount;
    private Instant createdAt;
    private Instant paidAt;
    private List<BillItemResponse> items;
    private String receiptText;
    private String whatsappLink;

    public static BillResponse from(Bill bill, String receiptText, String whatsappLink) {
        BillResponse response = new BillResponse();
        response.id = bill.getId();
        response.billNumber = bill.getBillNumber();
        response.labourName = bill.getLabourName();
        response.customerName = bill.getCustomerName();
        response.customerPhone = bill.getCustomerPhone();
        response.status = bill.getStatus();
        response.totalAmount = bill.getTotalAmount();
        response.createdAt = bill.getCreatedAt();
        response.paidAt = bill.getPaidAt();
        response.items = bill.getItems().stream().map(BillItemResponse::from).toList();
        response.receiptText = receiptText;
        response.whatsappLink = whatsappLink;
        return response;
    }

    public static BillResponse summary(Bill bill) {
        BillResponse response = new BillResponse();
        response.id = bill.getId();
        response.billNumber = bill.getBillNumber();
        response.labourName = bill.getLabourName();
        response.customerName = bill.getCustomerName();
        response.customerPhone = bill.getCustomerPhone();
        response.status = bill.getStatus();
        response.totalAmount = bill.getTotalAmount();
        response.createdAt = bill.getCreatedAt();
        response.paidAt = bill.getPaidAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public String getLabourName() {
        return labourName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public BillStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public List<BillItemResponse> getItems() {
        return items;
    }

    public String getReceiptText() {
        return receiptText;
    }

    public String getWhatsappLink() {
        return whatsappLink;
    }
}
