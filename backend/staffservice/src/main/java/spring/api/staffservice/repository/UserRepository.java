package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.staffservice.domain.User;
import spring.api.staffservice.domain.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
}

