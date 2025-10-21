package spring.api.maintenance.repository;

import spring.api.maintenance.entity.ServiceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceChecklistRepository extends JpaRepository<ServiceChecklist, Long> {

    // Find checklist items by order ID
    List<ServiceChecklist> findByOrderId(Long orderId);

    // Find completed checklist items
    List<ServiceChecklist> findByIsCompletedTrue();

    // Find pending checklist items
    List<ServiceChecklist> findByIsCompletedFalse();

    // Find checklist items by order and completion status
    List<ServiceChecklist> findByOrderIdAndIsCompleted(Long orderId, Boolean isCompleted);

    // Find checklist items by technician
    List<ServiceChecklist> findByCompletedBy(Long completedBy);

    // Find checklist items by completion date range
    List<ServiceChecklist> findByCompletedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find checklist items by item name containing keyword
    List<ServiceChecklist> findByItemNameContainingIgnoreCase(String itemName);

    // Find checklist items with notes
    @Query("SELECT sc FROM ServiceChecklist sc WHERE sc.notes IS NOT NULL AND sc.notes != ''")
    List<ServiceChecklist> findItemsWithNotes();

    // Find checklist items by order with details
    @Query("SELECT sc FROM ServiceChecklist sc LEFT JOIN FETCH sc.serviceOrder WHERE sc.orderId = :orderId")
    List<ServiceChecklist> findByOrderIdWithDetails(@Param("orderId") Long orderId);

    // Count completed items by order
    @Query("SELECT COUNT(sc) FROM ServiceChecklist sc WHERE sc.orderId = :orderId AND sc.isCompleted = true")
    long countCompletedItemsByOrderId(@Param("orderId") Long orderId);

    // Count total items by order
    @Query("SELECT COUNT(sc) FROM ServiceChecklist sc WHERE sc.orderId = :orderId")
    long countTotalItemsByOrderId(@Param("orderId") Long orderId);

    // Calculate completion percentage for order
    @Query("SELECT (COUNT(CASE WHEN sc.isCompleted = true THEN 1 END) * 100.0 / COUNT(sc)) FROM ServiceChecklist sc WHERE sc.orderId = :orderId")
    Double calculateCompletionPercentageByOrderId(@Param("orderId") Long orderId);

    // Find checklist items by technician and date range
    @Query("SELECT sc FROM ServiceChecklist sc WHERE sc.completedBy = :technicianId AND sc.completedAt BETWEEN :startDate AND :endDate")
    List<ServiceChecklist> findByTechnicianAndDateRange(@Param("technicianId") Long technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Count items by technician
    long countByCompletedBy(Long completedBy);

    // Count completed items by technician
    long countByCompletedByAndIsCompleted(Long completedBy, Boolean isCompleted);
}
