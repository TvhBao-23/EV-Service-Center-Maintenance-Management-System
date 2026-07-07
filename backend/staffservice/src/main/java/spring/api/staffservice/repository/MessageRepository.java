package spring.api.staffservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import spring.api.staffservice.domain.Message;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Get all messages between two users (conversation)
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId1 AND m.recipientId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.recipientId = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // Get all messages sent by a user
    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    
    // Get all messages received by a user
    List<Message> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    
    // Get unread messages for a user
    List<Message> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId);
    
    // Count unread messages for a user
    Long countByRecipientIdAndIsReadFalse(Long recipientId);
}

