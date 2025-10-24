package spring.api.evservicecenter.repository;

import spring.api.evservicecenter.entity.Staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {
    // (Bạn có thể thêm các phương thức tìm kiếm nhân viên theo vị trí, tên, v.v. ở đây)
    // Ví dụ: List<Staff> findByPosition(StaffPosition position);
}