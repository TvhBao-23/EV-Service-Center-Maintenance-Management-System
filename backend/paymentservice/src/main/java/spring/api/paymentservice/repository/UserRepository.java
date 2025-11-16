package spring.api.paymentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spring.api.paymentservice.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

