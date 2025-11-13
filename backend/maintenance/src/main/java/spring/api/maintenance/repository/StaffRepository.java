package spring.api.maintenance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.maintenance.entity.Staff;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    /**
     * Tìm staff theo user_id
     */
    Optional<Staff> findByUserId(Long userId);

    /**
     * Kiểm tra staff có tồn tại theo user_id
     */
    boolean existsByUserId(Long userId);
}
