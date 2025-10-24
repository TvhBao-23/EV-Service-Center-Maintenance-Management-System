package spring.api.evservicecenter.repository;

import spring.api.evservicecenter.entity.User;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    /**
     * Kiểm tra xem email đã tồn tại trong database hay chưa.
     * Nhanh hơn việc dùng findByEmail().isPresent() vì chỉ cần check (EXISTS).
     */
    Boolean existsByEmail(String email);

    /**
     * Tìm kiếm User bằng email (hữu ích cho việc đăng nhập).
     */
    Optional<User> findByEmail(String email);
}