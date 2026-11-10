package com.rajpipes.billing.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajpipes.billing.dto.BillItemRequest;
import com.rajpipes.billing.dto.BillResponse;
import com.rajpipes.billing.dto.CreateBillRequest;
import com.rajpipes.billing.dto.WhatsAppLinkResponse;
import com.rajpipes.billing.entity.Bill;
import com.rajpipes.billing.entity.BillItem;
import com.rajpipes.billing.entity.BillStatus;
import com.rajpipes.billing.entity.Product;
import com.rajpipes.billing.exception.ApiException;
import com.rajpipes.billing.repository.BillRepository;
import com.rajpipes.billing.repository.ProductRepository;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final ReceiptService receiptService;

    public BillService(BillRepository billRepository,
                       ProductRepository productRepository,
                       ReceiptService receiptService) {
        this.billRepository = billRepository;
        this.productRepository = productRepository;
        this.receiptService = receiptService;
    }

    @Transactional
    public BillResponse create(CreateBillRequest request) {
        if (request.getStatus() == null) {
            throw new ApiException("Bill status is required", HttpStatus.BAD_REQUEST);
        }

        Bill bill = new Bill();
        bill.setLabourName(request.getLabourName().trim());
        bill.setCustomerName(request.getCustomerName().trim());
        bill.setCustomerPhone(request.getCustomerPhone().trim());
        bill.setStatus(request.getStatus());
        bill.setCreatedAt(Instant.now());
        if (request.getStatus() == BillStatus.PAID) {
            bill.setPaidAt(Instant.now());
        }

        BigDecimal total = BigDecimal.ZERO;

        for (BillItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ApiException(
                            "Product not found: " + itemRequest.getProductId(), HttpStatus.NOT_FOUND));

            if (!product.isActive()) {
                throw new ApiException("Product is inactive: " + product.getName(), HttpStatus.BAD_REQUEST);
            }

            if (product.getStockQty() < itemRequest.getQuantity()) {
                throw new ApiException(
                        "Insufficient stock for " + product.getName()
                                + " (available: " + product.getStockQty() + ")",
                        HttpStatus.BAD_REQUEST);
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            BillItem item = new BillItem();
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setUnitPrice(unitPrice);
            item.setQuantity(itemRequest.getQuantity());
            item.setLineTotal(lineTotal);
            bill.addItem(item);

            product.setStockQty(product.getStockQty() - itemRequest.getQuantity());
            productRepository.save(product);

            total = total.add(lineTotal);
        }

        bill.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
        bill.setBillNumber("TEMP-" + UUID.randomUUID());
        Bill saved = billRepository.save(bill);
        saved.setBillNumber(formatBillNumber(saved.getId()));
        saved = billRepository.save(saved);

        return toDetail(saved);
    }

    @Transactional(readOnly = true)
    public List<BillResponse> list(BillStatus status) {
        List<Bill> bills = status == null
                ? billRepository.findAllByOrderByCreatedAtDesc()
                : billRepository.findByStatusOrderByCreatedAtDesc(status);
        return bills.stream().map(BillResponse::summary).toList();
    }

    @Transactional(readOnly = true)
    public BillResponse getById(Long id) {
        return toDetail(findWithItems(id));
    }

    @Transactional
    public BillResponse markPaid(Long id) {
        Bill bill = findWithItems(id);
        if (bill.getStatus() == BillStatus.PAID) {
            throw new ApiException("Bill is already paid", HttpStatus.BAD_REQUEST);
        }
        bill.setStatus(BillStatus.PAID);
        bill.setPaidAt(Instant.now());
        return toDetail(billRepository.save(bill));
    }

    @Transactional(readOnly = true)
    public WhatsAppLinkResponse whatsappLink(Long id) {
        Bill bill = findWithItems(id);
        String text = receiptService.buildReceiptText(bill);
        String url = receiptService.buildWhatsAppLink(bill);
        return new WhatsAppLinkResponse(url, text, PhoneUtil.normalizeForWhatsApp(bill.getCustomerPhone()));
    }

    private Bill findWithItems(Long id) {
        return billRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ApiException("Bill not found: " + id, HttpStatus.NOT_FOUND));
    }

    private BillResponse toDetail(Bill bill) {
        String receipt = receiptService.buildReceiptText(bill);
        String link = receiptService.buildWhatsAppLink(bill);
        return BillResponse.from(bill, receipt, link);
    }

    private String formatBillNumber(Long id) {
        return String.format("RP-%05d", id);
    }
}
