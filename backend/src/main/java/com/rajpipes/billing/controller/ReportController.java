package com.rajpipes.billing.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rajpipes.billing.dto.SalesReportResponse;
import com.rajpipes.billing.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public SalesReportResponse getSalesReport(@RequestParam(required = false, defaultValue = "30") Integer days) {
        return reportService.getSalesReport(days);
    }
}
