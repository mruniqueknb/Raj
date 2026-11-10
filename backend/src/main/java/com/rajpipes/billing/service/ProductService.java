package com.rajpipes.billing.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rajpipes.billing.dto.ProductRequest;
import com.rajpipes.billing.dto.ProductResponse;
import com.rajpipes.billing.entity.Product;
import com.rajpipes.billing.exception.ApiException;
import com.rajpipes.billing.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listAll(boolean activeOnly) {
        List<Product> products = activeOnly
                ? productRepository.findByActiveTrueOrderByNameAsc()
                : productRepository.findAllByOrderByNameAsc();
        return products.stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findEntity(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findEntity(id);
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = findEntity(id);
        product.setActive(false);
        productRepository.save(product);
    }

    public Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found: " + id, HttpStatus.NOT_FOUND));
    }

    private void apply(Product product, ProductRequest request) {
        product.setName(request.getName().trim());
        product.setSku(request.getSku() != null ? request.getSku().trim() : null);
        product.setUnit(request.getUnit() != null && !request.getUnit().isBlank() ? request.getUnit().trim() : "pcs");
        product.setPrice(request.getPrice());
        product.setStockQty(request.getStockQty());
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }
    }
}
