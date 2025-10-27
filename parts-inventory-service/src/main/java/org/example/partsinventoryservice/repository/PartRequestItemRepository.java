package org.example.partsinventoryservice.repository;

import org.example.partsinventoryservice.entity.PartRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartRequestItemRepository extends JpaRepository<PartRequestItem, Long> {
    List<PartRequestItem> findByRequest_RequestId(Long requestId);
}

