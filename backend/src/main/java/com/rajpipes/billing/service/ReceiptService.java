package com.rajpipes.billing.service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.rajpipes.billing.entity.Bill;
import com.rajpipes.billing.entity.BillItem;

@Service
public class ReceiptService {

    public String buildReceiptText(Bill bill) {
        StringBuilder sb = new StringBuilder();
        sb.append("🧾 *Raj Pipes & Electricals & Paints*\n");
        sb.append("📍 1/483 Sathankulam Main Road, Megnanapuram - 628210\n\n");
        sb.append("Bill #: ").append(bill.getBillNumber()).append('\n');
        sb.append("Labour: ").append(bill.getLabourName()).append('\n');
        sb.append("Customer: ").append(bill.getCustomerName()).append('\n');
        sb.append("Phone: ").append(bill.getCustomerPhone()).append('\n');
        sb.append("Items:\n");
        for (BillItem item : bill.getItems()) {
            sb.append("- ")
                    .append(item.getProductName())
                    .append(" x")
                    .append(item.getQuantity())
                    .append(" = ₹")
                    .append(formatAmount(item.getLineTotal()))
                    .append('\n');
        }
        sb.append("Total: ₹").append(formatAmount(bill.getTotalAmount())).append('\n');
        sb.append("Status: ").append(bill.getStatus().name()).append('\n');
        sb.append("Thank you for your business!");
        return sb.toString();
    }

    public String buildWhatsAppLink(Bill bill) {
        String phone = PhoneUtil.normalizeForWhatsApp(bill.getCustomerPhone());
        String text = buildReceiptText(bill);
        String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8).replace("+", "%20");
        return "https://wa.me/" + phone + "?text=" + encoded;
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        return String.format(Locale.US, "%,.2f", amount);
    }
}
