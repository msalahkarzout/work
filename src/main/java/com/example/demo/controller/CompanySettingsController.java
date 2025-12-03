package com.example.demo.controller;

import com.example.demo.model.CompanySettings;
import com.example.demo.repository.CompanySettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/company")
@CrossOrigin(origins = "*")
public class CompanySettingsController {

    @Autowired
    private CompanySettingsRepository companySettingsRepository;

    @GetMapping
    public ResponseEntity<CompanySettings> getCompanySettings() {
        List<CompanySettings> settings = companySettingsRepository.findAll();
        if (settings.isEmpty()) {
            // Create default settings
            CompanySettings defaultSettings = new CompanySettings();
            defaultSettings.setCompanyName("My Company");
            defaultSettings.setInvoicePrefix("FACT");
            defaultSettings.setNextInvoiceNumber(1);
            defaultSettings.setDefaultTaxRate(20.0);
            defaultSettings.setCurrency("EUR");
            return ResponseEntity.ok(companySettingsRepository.save(defaultSettings));
        }
        return ResponseEntity.ok(settings.get(0));
    }

    @PutMapping
    public ResponseEntity<CompanySettings> updateCompanySettings(@Valid @RequestBody CompanySettings settings) {
        List<CompanySettings> existingSettings = companySettingsRepository.findAll();
        if (existingSettings.isEmpty()) {
            return ResponseEntity.ok(companySettingsRepository.save(settings));
        } else {
            CompanySettings existing = existingSettings.get(0);
            settings.setId(existing.getId());
            return ResponseEntity.ok(companySettingsRepository.save(settings));
        }
    }

    @PostMapping("/generate-invoice-number")
    public ResponseEntity<String> generateInvoiceNumber() {
        CompanySettings settings = getCompanySettings().getBody();
        if (settings != null) {
            String invoiceNumber = String.format("%s-%04d",
                settings.getInvoicePrefix(),
                settings.getNextInvoiceNumber());
            settings.setNextInvoiceNumber(settings.getNextInvoiceNumber() + 1);
            companySettingsRepository.save(settings);
            return ResponseEntity.ok(invoiceNumber);
        }
        return ResponseEntity.ok("FACT-0001");
    }
}
