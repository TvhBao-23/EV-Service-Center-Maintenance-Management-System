package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.ChatConversation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    
    // Find conversation between customer and staff
    @Query("SELECT c FROM ChatConversation c WHERE " +
           "(c.customerId = :userId1 AND c.staffId = :userId2) OR " +
           "(c.customerId = :userId2 AND c.staffId = :userId1)")
    Optional<ChatConversation> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // Find all conversations for a customer
    List<ChatConversation> findByCustomerIdOrderByLastMessageAtDesc(Long customerId);
    
    // Find all conversations for a staff
    List<ChatConversation> findByStaffIdOrderByLastMessageAtDesc(Long staffId);
    
    // Find active conversations for staff
    List<ChatConversation> findByStaffIdAndStatusOrderByLastMessageAtDesc(Long staffId, ChatConversation.ConversationStatus status);
}

