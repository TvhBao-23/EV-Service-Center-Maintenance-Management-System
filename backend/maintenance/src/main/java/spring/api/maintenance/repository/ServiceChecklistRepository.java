package spring.api.maintenance.repository;

import spring.api.maintenance.entity.ServiceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository cho ServiceChecklist entity
 */
@Repository
public interface ServiceChecklistRepository extends JpaRepository<ServiceChecklist, Integer> {

    /**
     * Tìm checklist theo phiếu bảo dưỡng
     */
    List<ServiceChecklist> findByOrderId(Integer orderId);

    /**
     * Tìm checklist đã hoàn thành
     */
    List<ServiceChecklist> findByIsCompletedTrue();

    /**
     * Tìm checklist chưa hoàn thành
     */
    List<ServiceChecklist> findByIsCompletedFalse();

    /**
     * Tìm checklist theo người thực hiện
     */
    List<ServiceChecklist> findByCompletedBy(Integer completedBy);

    /**
     * Tìm checklist đã hoàn thành của một phiếu
     */
    @Query("SELECT sc FROM ServiceChecklist sc WHERE sc.orderId = :orderId AND sc.isCompleted = true")
    List<ServiceChecklist> findCompletedByOrderId(@Param("orderId") Integer orderId);

    /**
     * Tìm checklist chưa hoàn thành của một phiếu
     */
    @Query("SELECT sc FROM ServiceChecklist sc WHERE sc.orderId = :orderId AND sc.isCompleted = false")
    List<ServiceChecklist> findPendingByOrderId(@Param("orderId") Integer orderId);

    /**
     * Tính phần trăm hoàn thành của một phiếu
     */
    @Query("SELECT (COUNT(CASE WHEN sc.isCompleted = true THEN 1 END) * 100.0 / COUNT(sc)) FROM ServiceChecklist sc WHERE sc.orderId = :orderId")
    Double calculateCompletionPercentage(@Param("orderId") Integer orderId);

    /**
     * Đếm tổng số checklist của một phiếu
     */
    long countByOrderId(Integer orderId);

    /**
     * Đếm checklist đã hoàn thành của một phiếu
     */
    long countByOrderIdAndIsCompletedTrue(Integer orderId);

    /**
     * Tìm checklist theo phiếu và trạng thái hoàn thành
     */
    List<ServiceChecklist> findByOrderIdAndIsCompleted(Integer orderId, Boolean isCompleted);
}