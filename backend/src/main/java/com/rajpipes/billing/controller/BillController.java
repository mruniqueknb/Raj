package com.rajpipes.billing.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.rajpipes.billing.dto.BillResponse;
import com.rajpipes.billing.dto.CreateBillRequest;
import com.rajpipes.billing.dto.WhatsAppLinkResponse;
import com.rajpipes.billing.entity.BillStatus;
import com.rajpipes.billing.service.BillService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BillResponse create(@Valid @RequestBody CreateBillRequest request) {
        return billService.create(request);
    }

    @GetMapping
    public List<BillResponse> list(@RequestParam(required = false) BillStatus status) {
        return billService.list(status);
    }

    @GetMapping("/{id}")
    public BillResponse get(@PathVariable Long id) {
        return billService.getById(id);
    }

    @PostMapping("/{id}/mark-paid")
    public BillResponse markPaid(@PathVariable Long id) {
        return billService.markPaid(id);
    }

    @GetMapping("/{id}/whatsapp-link")
    public WhatsAppLinkResponse whatsappLink(@PathVariable Long id) {
        return billService.whatsappLink(id);
    }
}
