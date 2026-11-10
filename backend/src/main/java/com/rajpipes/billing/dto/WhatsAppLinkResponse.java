package com.rajpipes.billing.dto;

public class WhatsAppLinkResponse {

    private String url;
    private String receiptText;
    private String phone;

    public WhatsAppLinkResponse(String url, String receiptText, String phone) {
        this.url = url;
        this.receiptText = receiptText;
        this.phone = phone;
    }

    public String getUrl() {
        return url;
    }

    public String getReceiptText() {
        return receiptText;
    }

    public String getPhone() {
        return phone;
    }
}
