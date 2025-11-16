package spring.api.staffservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.api.staffservice.domain.ChatConversation;
import spring.api.staffservice.domain.Message;
import spring.api.staffservice.domain.User;
import spring.api.staffservice.domain.UserRole;
import spring.api.staffservice.dto.MessageDTO;
import spring.api.staffservice.dto.SendMessageRequest;
import spring.api.staffservice.repository.ChatConversationRepository;
import spring.api.staffservice.repository.MessageRepository;
import spring.api.staffservice.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final ChatConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageDTO sendMessage(Long senderId, SendMessageRequest request) {
        // Create message
        Message message = new Message();
        message.setSenderId(senderId);
        message.setRecipientId(request.getRecipientId());
        message.setSubject(request.getSubject());
        message.setMessageText(request.getMessageText());
        message.setParentMessageId(request.getParentMessageId());
        message.setIsRead(false);
        
        Message savedMessage = messageRepository.save(message);

        // Update or create conversation
        updateConversation(senderId, request.getRecipientId());

        return toDTO(savedMessage);
    }

    public List<MessageDTO> getConversation(Long userId1, Long userId2) {
        List<Message> messages = messageRepository.findConversationBetweenUsers(userId1, userId2);
        return messages.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getUnreadMessages(Long userId) {
        List<Message> messages = messageRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return messages.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        messageRepository.save(message);
    }

    @Transactional
    public void markConversationAsRead(Long currentUserId, Long otherUserId) {
        List<Message> unreadMessages = messageRepository
                .findConversationBetweenUsers(currentUserId, otherUserId)
                .stream()
                .filter(m -> m.getRecipientId().equals(currentUserId) && !m.getIsRead())
                .collect(Collectors.toList());

        for (Message message : unreadMessages) {
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }

    public Long getUnreadCount(Long userId) {
        return messageRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    private void updateConversation(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1).orElse(null);
        User user2 = userRepository.findById(userId2).orElse(null);

        if (user1 == null || user2 == null) return;

        // Determine customer and staff
        Long customerId = user1.getRole().equals(UserRole.customer) ? userId1 : userId2;
        Long staffId = user1.getRole().equals(UserRole.customer) ? userId2 : userId1;

        // Find or create conversation
        ChatConversation conversation = conversationRepository
                .findConversationBetweenUsers(userId1, userId2)
                .orElse(new ChatConversation());

        conversation.setCustomerId(customerId);
        conversation.setStaffId(staffId);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversation.setStatus(ChatConversation.ConversationStatus.active);

        conversationRepository.save(conversation);
    }

    private MessageDTO toDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setSenderId(message.getSenderId());
        dto.setRecipientId(message.getRecipientId());
        dto.setSubject(message.getSubject());
        dto.setMessageText(message.getMessageText());
        dto.setIsRead(message.getIsRead());
        dto.setParentMessageId(message.getParentMessageId());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());

        // Load sender info
        User sender = userRepository.findById(message.getSenderId()).orElse(null);
        if (sender != null) {
            dto.setSenderName(sender.getFullName());
            dto.setSenderEmail(sender.getEmail());
        }

        // Load recipient info
        User recipient = userRepository.findById(message.getRecipientId()).orElse(null);
        if (recipient != null) {
            dto.setRecipientName(recipient.getFullName());
            dto.setRecipientEmail(recipient.getEmail());
        }

        return dto;
    }
}

