package org.example.partsinventoryservice.repository;

import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartTransactionRepository extends JpaRepository<PartTransaction, Long> {
    List<PartTransaction> findAllByOrderByCreatedAtDesc();
    List<PartTransaction> findByPart_PartIdOrderByCreatedAtDesc(Long partId);
    List<PartTransaction> findByTypeOrderByCreatedAtDesc(TransactionType type);
}



