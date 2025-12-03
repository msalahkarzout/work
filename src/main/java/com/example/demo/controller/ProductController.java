package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Product createProduct(@Valid @RequestBody Product product, HttpServletRequest request) {
        Product savedProduct = productRepository.save(product);

        // Log activity
        activityLogService.log("CREATE", "PRODUCT", savedProduct.getId(),
            String.format("Created product: %s, price: %s, stock: %d",
                savedProduct.getName(), savedProduct.getPrice(), savedProduct.getStockQuantity()),
            request);

        return savedProduct;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product productDetails, HttpServletRequest request) {
        return productRepository.findById(id)
                .map(product -> {
                    String oldName = product.getName();
                    product.setName(productDetails.getName());
                    product.setDescription(productDetails.getDescription());
                    product.setPrice(productDetails.getPrice());
                    product.setStockQuantity(productDetails.getStockQuantity());
                    product.setCategory(productDetails.getCategory());
                    Product savedProduct = productRepository.save(product);

                    // Log activity
                    activityLogService.log("UPDATE", "PRODUCT", savedProduct.getId(),
                        String.format("Updated product: %s, new price: %s, stock: %d",
                            savedProduct.getName(), savedProduct.getPrice(), savedProduct.getStockQuantity()),
                        request);

                    return ResponseEntity.ok(savedProduct);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        return productRepository.findById(id)
                .map(product -> {
                    String productName = product.getName();
                    productRepository.delete(product);

                    // Log activity
                    activityLogService.log("DELETE", "PRODUCT", id,
                        String.format("Deleted product: %s", productName),
                        request);

                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productRepository.findByCategory(category);
    }

    @GetMapping("/search/{name}")
    public List<Product> searchProducts(@PathVariable String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts() {
        return productRepository.findByStockQuantityLessThan(10);
    }
}
