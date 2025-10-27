package org.example.partsinventoryservice.respository;

import org.example.partsinventoryservice.entity.PartTransaction;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartTransactionRepository extends JpaRepository<PartTransaction, Long> {
    List<PartTransaction> findByTransactionType(TransactionType type);
    List<PartTransaction> findByPart_PartId(Long partId);
}

