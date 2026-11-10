package com.rajpipes.billing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rajpipes.billing.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrueOrderByNameAsc();
    List<Product> findAllByOrderByNameAsc();
}
