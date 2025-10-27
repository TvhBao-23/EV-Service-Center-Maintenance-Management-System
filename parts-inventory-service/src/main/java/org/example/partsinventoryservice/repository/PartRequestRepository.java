package org.example.partsinventoryservice.repository;

import org.example.partsinventoryservice.entity.PartRequest;
import org.example.partsinventoryservice.entity.enum_.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartRequestRepository extends JpaRepository<PartRequest, Long> {
    List<PartRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);
}


