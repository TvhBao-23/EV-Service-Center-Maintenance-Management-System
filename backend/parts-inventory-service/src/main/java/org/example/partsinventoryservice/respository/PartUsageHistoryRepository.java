package org.example.partsinventoryservice.respository;

import org.example.partsinventoryservice.model.Part;
import org.example.partsinventoryservice.model.PartUsageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartUsageHistoryRepository extends JpaRepository<PartUsageHistory, Long> {
    List<PartUsageHistory> findByPart(Part part);
    List<PartUsageHistory> findByOrderId(Long orderId);
}