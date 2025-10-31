package spring.api.maintenance.repository;

import spring.api.maintenance.entity.TechnicianReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianReportRepository extends JpaRepository<TechnicianReport, Integer> {

    // Lấy tất cả báo cáo theo order_id
    List<TechnicianReport> findByOrderId(Integer orderId);

    // Lấy tất cả báo cáo theo staff_id
    List<TechnicianReport> findByStaffId(Integer staffId);

    // Lấy tất cả báo cáo theo order_id và staff_id
    List<TechnicianReport> findByOrderIdAndStaffId(Integer orderId, Integer staffId);

    // Lấy báo cáo theo status
    List<TechnicianReport> findByStatus(TechnicianReport.ReportStatus status);
}
