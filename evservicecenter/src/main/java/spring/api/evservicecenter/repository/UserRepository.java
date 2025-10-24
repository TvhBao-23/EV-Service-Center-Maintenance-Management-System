package spring.api.evservicecenter.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.evservicecenter.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Có thể thêm các phương thức tìm kiếm (find by email) ở đây nếu cần
}