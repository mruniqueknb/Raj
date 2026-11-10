package com.rajpipes.billing.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SalesReportResponse {

    private BigDecimal totalPaidRevenue = BigDecimal.ZERO;
    private BigDecimal totalCreditAmount = BigDecimal.ZERO;
    private long totalBillsCount = 0;
    private long paidBillsCount = 0;
    private long creditBillsCount = 0;
    private BigDecimal todaySales = BigDecimal.ZERO;
    private long todayBillsCount = 0;
    private BigDecimal thisMonthSales = BigDecimal.ZERO;
    private long thisMonthBillsCount = 0;
    private BigDecimal avgBillAmount = BigDecimal.ZERO;

    private List<DailySalesPoint> dailySales = new ArrayList<>();
    private List<LabourSalesPoint> labourSales = new ArrayList<>();
    private List<ProductSalesPoint> topProducts = new ArrayList<>();

    public static class DailySalesPoint {
        private String date;
        private BigDecimal revenue = BigDecimal.ZERO;
        private BigDecimal creditAmount = BigDecimal.ZERO;
        private long billsCount = 0;

        public DailySalesPoint() {}

        public DailySalesPoint(String date, BigDecimal revenue, BigDecimal creditAmount, long billsCount) {
            this.date = date;
            this.revenue = revenue;
            this.creditAmount = creditAmount;
            this.billsCount = billsCount;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        public BigDecimal getCreditAmount() {
            return creditAmount;
        }

        public void setCreditAmount(BigDecimal creditAmount) {
            this.creditAmount = creditAmount;
        }

        public long getBillsCount() {
            return billsCount;
        }

        public void setBillsCount(long billsCount) {
            this.billsCount = billsCount;
        }
    }

    public static class LabourSalesPoint {
        private String labourName;
        private BigDecimal revenue = BigDecimal.ZERO;
        private long billsCount = 0;

        public LabourSalesPoint() {}

        public LabourSalesPoint(String labourName, BigDecimal revenue, long billsCount) {
            this.labourName = labourName;
            this.revenue = revenue;
            this.billsCount = billsCount;
        }

        public String getLabourName() {
            return labourName;
        }

        public void setLabourName(String labourName) {
            this.labourName = labourName;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        public long getBillsCount() {
            return billsCount;
        }

        public void setBillsCount(long billsCount) {
            this.billsCount = billsCount;
        }
    }

    public static class ProductSalesPoint {
        private String productName;
        private long quantitySold = 0;
        private BigDecimal totalRevenue = BigDecimal.ZERO;

        public ProductSalesPoint() {}

        public ProductSalesPoint(String productName, long quantitySold, BigDecimal totalRevenue) {
            this.productName = productName;
            this.quantitySold = quantitySold;
            this.totalRevenue = totalRevenue;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public long getQuantitySold() {
            return quantitySold;
        }

        public void setQuantitySold(long quantitySold) {
            this.quantitySold = quantitySold;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
    }

    public BigDecimal getTotalPaidRevenue() {
        return totalPaidRevenue;
    }

    public void setTotalPaidRevenue(BigDecimal totalPaidRevenue) {
        this.totalPaidRevenue = totalPaidRevenue;
    }

    public BigDecimal getTotalCreditAmount() {
        return totalCreditAmount;
    }

    public void setTotalCreditAmount(BigDecimal totalCreditAmount) {
        this.totalCreditAmount = totalCreditAmount;
    }

    public long getTotalBillsCount() {
        return totalBillsCount;
    }

    public void setTotalBillsCount(long totalBillsCount) {
        this.totalBillsCount = totalBillsCount;
    }

    public long getPaidBillsCount() {
        return paidBillsCount;
    }

    public void setPaidBillsCount(long paidBillsCount) {
        this.paidBillsCount = paidBillsCount;
    }

    public long getCreditBillsCount() {
        return creditBillsCount;
    }

    public void setCreditBillsCount(long creditBillsCount) {
        this.creditBillsCount = creditBillsCount;
    }

    public BigDecimal getTodaySales() {
        return todaySales;
    }

    public void setTodaySales(BigDecimal todaySales) {
        this.todaySales = todaySales;
    }

    public long getTodayBillsCount() {
        return todayBillsCount;
    }

    public void setTodayBillsCount(long todayBillsCount) {
        this.todayBillsCount = todayBillsCount;
    }

    public BigDecimal getThisMonthSales() {
        return thisMonthSales;
    }

    public void setThisMonthSales(BigDecimal thisMonthSales) {
        this.thisMonthSales = thisMonthSales;
    }

    public long getThisMonthBillsCount() {
        return thisMonthBillsCount;
    }

    public void setThisMonthBillsCount(long thisMonthBillsCount) {
        this.thisMonthBillsCount = thisMonthBillsCount;
    }

    public BigDecimal getAvgBillAmount() {
        return avgBillAmount;
    }

    public void setAvgBillAmount(BigDecimal avgBillAmount) {
        this.avgBillAmount = avgBillAmount;
    }

    public List<DailySalesPoint> getDailySales() {
        return dailySales;
    }

    public void setDailySales(List<DailySalesPoint> dailySales) {
        this.dailySales = dailySales;
    }

    public List<LabourSalesPoint> getLabourSales() {
        return labourSales;
    }

    public void setLabourSales(List<LabourSalesPoint> labourSales) {
        this.labourSales = labourSales;
    }

    public List<ProductSalesPoint> getTopProducts() {
        return topProducts;
    }

    public void setTopProducts(List<ProductSalesPoint> topProducts) {
        this.topProducts = topProducts;
    }
}
