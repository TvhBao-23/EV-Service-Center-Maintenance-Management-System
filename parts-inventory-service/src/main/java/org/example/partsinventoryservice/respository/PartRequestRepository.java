package org.example.partsinventoryservice.respository;

import org.example.partsinventoryservice.entity.PartRequest;
import org.example.partsinventoryservice.entity.enum_.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartRequestRepository extends JpaRepository<PartRequest, Long> {
    List<PartRequest> findByStatus(RequestStatus status);
}

