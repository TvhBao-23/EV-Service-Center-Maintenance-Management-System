package spring.api.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spring.api.authservice.domain.PasswordResetToken;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    
    Optional<PasswordResetToken> findByEmailAndTokenAndUsedFalse(String email, String token);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    
    void deleteByEmail(String email);
}

