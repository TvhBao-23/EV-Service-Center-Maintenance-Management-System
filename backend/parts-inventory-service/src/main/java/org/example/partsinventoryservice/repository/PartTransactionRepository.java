package org.example.partsinventoryservice.repository;

import jakarta.transaction.Transactional;
import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartTransactionRepository extends JpaRepository<PartTransaction, Long> {
    @EntityGraph(attributePaths = "part")
    List<PartTransaction> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "part")
    List<PartTransaction> findByPart_PartIdOrderByCreatedAtDesc(Long partId);

    List<PartTransaction> findByTypeOrderByCreatedAtDesc(TransactionType type);

    @Transactional
    void deleteAllByPart_PartId(Long partId);
}



