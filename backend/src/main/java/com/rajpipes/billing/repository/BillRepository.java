package com.rajpipes.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rajpipes.billing.entity.Bill;
import com.rajpipes.billing.entity.BillStatus;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByStatusOrderByCreatedAtDesc(BillStatus status);

    List<Bill> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT b FROM Bill b LEFT JOIN FETCH b.items ORDER BY b.createdAt DESC")
    List<Bill> findAllWithItemsOrderByCreatedAtDesc();

    @Query("SELECT b FROM Bill b LEFT JOIN FETCH b.items WHERE b.id = :id")
    Optional<Bill> findByIdWithItems(@Param("id") Long id);
}
