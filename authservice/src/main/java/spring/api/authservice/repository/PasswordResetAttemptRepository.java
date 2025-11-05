package spring.api.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.authservice.domain.PasswordResetAttempt;

import java.util.Optional;

@Repository
public interface PasswordResetAttemptRepository extends JpaRepository<PasswordResetAttempt, Long> {
    
    Optional<PasswordResetAttempt> findByEmail(String email);
    
    Optional<PasswordResetAttempt> findByEmailAndIpAddress(String email, String ipAddress);
}

