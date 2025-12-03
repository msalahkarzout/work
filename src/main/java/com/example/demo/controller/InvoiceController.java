package com.example.demo.controller;

import com.example.demo.dto.InvoiceRequest;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.InvoiceItem;
import com.example.demo.entity.Product;
import com.example.demo.model.Client;
import com.example.demo.model.CompanySettings;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ClientRepository;
import com.example.demo.repository.CompanySettingsRepository;
import com.example.demo.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private CompanySettingsRepository companySettingsRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceRequest request, HttpServletRequest httpRequest) {
        try {
            // Create new invoice
            Invoice invoice = new Invoice();
            invoice.setCustomerName(request.getCustomerName());

            // Get company settings for invoice number and tax rate
            List<CompanySettings> settingsList = companySettingsRepository.findAll();
            CompanySettings settings = settingsList.isEmpty() ? null : settingsList.get(0);

            // Generate invoice number
            if (settings != null) {
                String invoiceNumber = String.format("%s-%04d",
                    settings.getInvoicePrefix(),
                    settings.getNextInvoiceNumber());
                invoice.setInvoiceNumber(invoiceNumber);
                settings.setNextInvoiceNumber(settings.getNextInvoiceNumber() + 1);
                companySettingsRepository.save(settings);
            } else {
                invoice.setInvoiceNumber("FACT-0001");
            }

            // Set tax rate from settings
            if (settings != null) {
                invoice.setTaxRate(BigDecimal.valueOf(settings.getDefaultTaxRate()));
            } else {
                invoice.setTaxRate(BigDecimal.valueOf(20.0));
            }

            // Create invoice items and calculate subtotal
            BigDecimal subtotal = BigDecimal.ZERO;
            List<InvoiceItem> invoiceItems = new ArrayList<>();

            for (InvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemRequest.getProductId()));

                // Check stock
                if (product.getStockQuantity() < itemRequest.getQuantity()) {
                    return ResponseEntity.badRequest()
                            .body("Insufficient stock for product: " + product.getName());
                }

                // Create invoice item
                InvoiceItem item = new InvoiceItem();
                item.setProduct(product);
                item.setQuantity(itemRequest.getQuantity());
                item.setUnitPrice(product.getPrice());
                item.setSubtotal(product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP));
                item.setInvoice(invoice);

                invoiceItems.add(item);
                subtotal = subtotal.add(item.getSubtotal());

                // Update stock
                product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
                productRepository.save(product);
            }

            invoice.setItems(invoiceItems);
            invoice.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
            invoice.setDiscount(BigDecimal.ZERO);

            // Calculate tax
            BigDecimal taxAmount = subtotal
                .multiply(invoice.getTaxRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            invoice.setTaxAmount(taxAmount);

            // Calculate total
            BigDecimal totalAmount = subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP);
            invoice.setTotalAmount(totalAmount);

            Invoice savedInvoice = invoiceRepository.save(invoice);

            // Log activity
            activityLogService.log("CREATE", "INVOICE", savedInvoice.getId(),
                String.format("Created invoice %s for customer %s, total: %s",
                    savedInvoice.getInvoiceNumber(), savedInvoice.getCustomerName(), savedInvoice.getTotalAmount()),
                httpRequest);

            return ResponseEntity.ok(savedInvoice);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating invoice: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvoice(@PathVariable Long id, @RequestBody InvoiceRequest request, HttpServletRequest httpRequest) {
        try {
            return invoiceRepository.findById(id)
                    .map(invoice -> {
                        String oldCustomerName = invoice.getCustomerName();

                        // Update customer name
                        invoice.setCustomerName(request.getCustomerName());

                        // Clear existing items and restore stock
                        for (InvoiceItem oldItem : invoice.getItems()) {
                            Product product = oldItem.getProduct();
                            product.setStockQuantity(product.getStockQuantity() + oldItem.getQuantity());
                            productRepository.save(product);
                        }
                        invoice.getItems().clear();

                        // Create new invoice items and calculate subtotal
                        BigDecimal subtotal = BigDecimal.ZERO;
                        List<InvoiceItem> invoiceItems = new ArrayList<>();

                        for (InvoiceRequest.InvoiceItemRequest itemRequest : request.getItems()) {
                            Product product = productRepository.findById(itemRequest.getProductId())
                                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemRequest.getProductId()));

                            // Check stock
                            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                                throw new RuntimeException("Insufficient stock for product: " + product.getName());
                            }

                            // Create invoice item
                            InvoiceItem item = new InvoiceItem();
                            item.setProduct(product);
                            item.setQuantity(itemRequest.getQuantity());
                            item.setUnitPrice(product.getPrice());
                            item.setSubtotal(product.getPrice()
                                .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                                .setScale(2, RoundingMode.HALF_UP));
                            item.setInvoice(invoice);

                            invoiceItems.add(item);
                            subtotal = subtotal.add(item.getSubtotal());

                            // Update stock
                            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
                            productRepository.save(product);
                        }

                        invoice.setItems(invoiceItems);
                        invoice.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));

                        // Calculate tax
                        BigDecimal taxAmount = subtotal
                            .multiply(invoice.getTaxRate())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                        invoice.setTaxAmount(taxAmount);

                        // Calculate total
                        BigDecimal totalAmount = subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP);
                        invoice.setTotalAmount(totalAmount);

                        Invoice savedInvoice = invoiceRepository.save(invoice);

                        // Log activity
                        activityLogService.log("UPDATE", "INVOICE", savedInvoice.getId(),
                            String.format("Updated invoice %s, customer: %s, new total: %s",
                                savedInvoice.getInvoiceNumber(), savedInvoice.getCustomerName(), savedInvoice.getTotalAmount()),
                            httpRequest);

                        return ResponseEntity.ok(savedInvoice);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating invoice: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Long id, @RequestParam String status, HttpServletRequest httpRequest) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    String oldStatus = invoice.getStatus().name();
                    invoice.setStatus(Invoice.InvoiceStatus.valueOf(status));
                    Invoice savedInvoice = invoiceRepository.save(invoice);

                    // Log activity
                    activityLogService.log("STATUS_CHANGE", "INVOICE", savedInvoice.getId(),
                        String.format("Changed invoice %s status from %s to %s",
                            savedInvoice.getInvoiceNumber(), oldStatus, status),
                        httpRequest);

                    return ResponseEntity.ok(savedInvoice);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id, HttpServletRequest httpRequest) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    String invoiceNumber = invoice.getInvoiceNumber();
                    String customerName = invoice.getCustomerName();

                    invoiceRepository.delete(invoice);

                    // Log activity
                    activityLogService.log("DELETE", "INVOICE", id,
                        String.format("Deleted invoice %s for customer %s", invoiceNumber, customerName),
                        httpRequest);

                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search/{customerName}")
    public List<Invoice> searchInvoices(@PathVariable String customerName) {
        return invoiceRepository.findByCustomerNameContainingIgnoreCase(customerName);
    }
}
