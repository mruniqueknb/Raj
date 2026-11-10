package com.rajpipes.billing.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajpipes.billing.dto.SalesReportResponse;
import com.rajpipes.billing.entity.Bill;
import com.rajpipes.billing.entity.BillItem;
import com.rajpipes.billing.entity.BillStatus;
import com.rajpipes.billing.repository.BillRepository;

@Service
public class ReportService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final BillRepository billRepository;

    public ReportService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @Transactional(readOnly = true)
    public SalesReportResponse getSalesReport(Integer daysLimit) {
        int days = (daysLimit == null || daysLimit <= 0) ? 30 : daysLimit;

        List<Bill> allBills = billRepository.findAllWithItemsOrderByCreatedAtDesc();
        SalesReportResponse response = new SalesReportResponse();

        LocalDate today = LocalDate.now(ZONE);
        int currentYear = today.getYear();
        int currentMonth = today.getMonthValue();

        BigDecimal totalPaidRevenue = BigDecimal.ZERO;
        BigDecimal totalCreditAmount = BigDecimal.ZERO;
        long totalBillsCount = allBills.size();
        long paidBillsCount = 0;
        long creditBillsCount = 0;

        BigDecimal todaySales = BigDecimal.ZERO;
        long todayBillsCount = 0;
        BigDecimal thisMonthSales = BigDecimal.ZERO;
        long thisMonthBillsCount = 0;

        // Daily aggregation: Last N days pre-populated with 0 so chart shows clean continuous timeline
        Map<String, SalesReportResponse.DailySalesPoint> dailyMap = new TreeMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String key = d.format(DATE_FORMATTER);
            dailyMap.put(key, new SalesReportResponse.DailySalesPoint(key, BigDecimal.ZERO, BigDecimal.ZERO, 0));
        }

        Map<String, SalesReportResponse.LabourSalesPoint> labourMap = new HashMap<>();
        Map<String, SalesReportResponse.ProductSalesPoint> productMap = new HashMap<>();

        for (Bill bill : allBills) {
            LocalDate billDate = bill.getCreatedAt() != null
                    ? bill.getCreatedAt().atZone(ZONE).toLocalDate()
                    : today;
            String dateKey = billDate.format(DATE_FORMATTER);
            BigDecimal amount = bill.getTotalAmount() != null ? bill.getTotalAmount() : BigDecimal.ZERO;

            boolean isPaid = bill.getStatus() == BillStatus.PAID;
            if (isPaid) {
                totalPaidRevenue = totalPaidRevenue.add(amount);
                paidBillsCount++;
            } else {
                totalCreditAmount = totalCreditAmount.add(amount);
                creditBillsCount++;
            }

            // Today metrics
            if (billDate.equals(today)) {
                todayBillsCount++;
                if (isPaid) {
                    todaySales = todaySales.add(amount);
                }
            }

            // Month metrics
            if (billDate.getYear() == currentYear && billDate.getMonthValue() == currentMonth) {
                thisMonthBillsCount++;
                if (isPaid) {
                    thisMonthSales = thisMonthSales.add(amount);
                }
            }

            // Daily chart point (track both paid revenue and credit added)
            if (dailyMap.containsKey(dateKey)) {
                SalesReportResponse.DailySalesPoint point = dailyMap.get(dateKey);
                point.setBillsCount(point.getBillsCount() + 1);
                if (isPaid) {
                    point.setRevenue(point.getRevenue().add(amount));
                } else {
                    point.setCreditAmount(point.getCreditAmount().add(amount));
                }
            }

            // Labour stats
            String labour = (bill.getLabourName() != null && !bill.getLabourName().isBlank())
                    ? bill.getLabourName().trim()
                    : "Unknown";
            SalesReportResponse.LabourSalesPoint labourPoint = labourMap.computeIfAbsent(
                    labour, k -> new SalesReportResponse.LabourSalesPoint(k, BigDecimal.ZERO, 0));
            labourPoint.setBillsCount(labourPoint.getBillsCount() + 1);
            if (isPaid) {
                labourPoint.setRevenue(labourPoint.getRevenue().add(amount));
            }

            // Products stats
            if (bill.getItems() != null) {
                for (BillItem item : bill.getItems()) {
                    String pName = item.getProductName() != null ? item.getProductName().trim() : "Other";
                    int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                    BigDecimal lineTotal = item.getLineTotal() != null ? item.getLineTotal() : BigDecimal.ZERO;

                    SalesReportResponse.ProductSalesPoint prodPoint = productMap.computeIfAbsent(
                            pName, k -> new SalesReportResponse.ProductSalesPoint(k, 0, BigDecimal.ZERO));
                    prodPoint.setQuantitySold(prodPoint.getQuantitySold() + qty);
                    prodPoint.setTotalRevenue(prodPoint.getTotalRevenue().add(lineTotal));
                }
            }
        }

        response.setTotalPaidRevenue(totalPaidRevenue.setScale(2, RoundingMode.HALF_UP));
        response.setTotalCreditAmount(totalCreditAmount.setScale(2, RoundingMode.HALF_UP));
        response.setTotalBillsCount(totalBillsCount);
        response.setPaidBillsCount(paidBillsCount);
        response.setCreditBillsCount(creditBillsCount);
        response.setTodaySales(todaySales.setScale(2, RoundingMode.HALF_UP));
        response.setTodayBillsCount(todayBillsCount);
        response.setThisMonthSales(thisMonthSales.setScale(2, RoundingMode.HALF_UP));
        response.setThisMonthBillsCount(thisMonthBillsCount);

        if (paidBillsCount > 0) {
            response.setAvgBillAmount(totalPaidRevenue.divide(BigDecimal.valueOf(paidBillsCount), 2, RoundingMode.HALF_UP));
        }

        response.setDailySales(new ArrayList<>(dailyMap.values()));

        List<SalesReportResponse.LabourSalesPoint> sortedLabour = new ArrayList<>(labourMap.values());
        sortedLabour.sort(Comparator.comparing(SalesReportResponse.LabourSalesPoint::getRevenue).reversed());
        response.setLabourSales(sortedLabour);

        List<SalesReportResponse.ProductSalesPoint> sortedProducts = new ArrayList<>(productMap.values());
        sortedProducts.sort(Comparator.comparing(SalesReportResponse.ProductSalesPoint::getTotalRevenue).reversed());
        response.setTopProducts(sortedProducts);

        return response;
    }
}
