package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.PartRequest;

import java.util.List;

@Repository
public interface PartRequestRepository extends JpaRepository<PartRequest, Long> {
    List<PartRequest> findByCustomerId(Long customerId);
    List<PartRequest> findByPartId(Long partId);
    List<PartRequest> findByStatus(PartRequest.RequestStatus status);
    List<PartRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}

