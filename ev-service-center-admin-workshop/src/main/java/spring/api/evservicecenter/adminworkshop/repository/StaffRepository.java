package spring.api.evservicecenter.adminworkshop.repository;

import spring.api.evservicecenter.adminworkshop.dto.StaffResponseDTO;
import spring.api.evservicecenter.adminworkshop.entity.Staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {

    /**
     * Finds a Staff entity along with its associated User eagerly.
     */
    @Query("SELECT s FROM Staff s JOIN FETCH s.user u WHERE s.staffId = :staffId")
    Optional<Staff> findByIdWithUser(Integer staffId);

    /**
     * Finds all staff members and projects them into StaffResponseDTO.
     * Uses a constructor expression for efficiency.
     */
    @Query("SELECT new com.evservicecenter.dto.StaffResponseDTO(" +
           "s.staffId, u.userId, u.fullName, u.email, u.phone, u.role, s.position, s.hireDate, u.isActive, u.createdAt) " +
           "FROM Staff s JOIN s.user u " +
           // Exclude customers just in case role ENUM gets mixed up
           "WHERE u.role IN ('staff', 'technician', 'admin')")
    List<StaffResponseDTO> findAllStaffSummaries();

    @Query("SELECT new com.evservicecenter.dto.StaffResponseDTO(" +
           "s.staffId, u.userId, u.fullName, u.email, u.phone, u.role, s.position, s.hireDate, u.isActive, u.createdAt) " +
           "FROM Staff s JOIN s.user u " +
           // Sửa lại: Dùng tên ENUM đầy đủ hoặc import ENUM rồi dùng tên ngắn
           "WHERE u.isActive = true AND s.position = com.evservicecenter.enums.StaffPosition.technician " +
           "ORDER BY u.fullName")
    List<StaffResponseDTO> findAllActiveTechnicians(); // Đảm bảo phương thức này tồn tại


}