package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class InvoiceRequest {
    private String customerName;
    private List<InvoiceItemRequest> items;

    @Data
    public static class InvoiceItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
