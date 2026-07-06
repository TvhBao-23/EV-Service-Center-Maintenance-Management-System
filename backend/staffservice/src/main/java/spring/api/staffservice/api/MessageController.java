package spring.api.staffservice.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import spring.api.staffservice.domain.ChatConversation;
import spring.api.staffservice.domain.User;
import spring.api.staffservice.domain.UserRole;
import spring.api.staffservice.dto.MessageDTO;
import spring.api.staffservice.dto.SendMessageRequest;
import spring.api.staffservice.repository.ChatConversationRepository;
import spring.api.staffservice.repository.UserRepository;
import spring.api.staffservice.service.MessageService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final ChatConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody SendMessageRequest request,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long senderId = currentUser.getUserId();
        
        MessageDTO sentMessage = messageService.sendMessage(senderId, request);
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<MessageDTO>> getConversation(
            @PathVariable Long otherUserId,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getUserId();
        
        List<MessageDTO> conversation = messageService.getConversation(currentUserId, otherUserId);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getUserId();
        
        List<ChatConversation> conversations;
        if (currentUser.getRole() == UserRole.customer) {
            conversations = conversationRepository.findByCustomerIdOrderByLastMessageAtDesc(currentUserId);
        } else {
            conversations = conversationRepository.findByStaffIdOrderByLastMessageAtDesc(currentUserId);
        }
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (ChatConversation conv : conversations) {
            Map<String, Object> map = new HashMap<>();
            map.put("conversationId", conv.getConversationId());
            map.put("customerId", conv.getCustomerId());
            map.put("staffId", conv.getStaffId());
            map.put("subject", conv.getSubject());
            map.put("status", conv.getStatus().name());
            map.put("lastMessageAt", conv.getLastMessageAt());
            
            // Determine other user ID
            Long otherUserId = currentUserId.equals(conv.getCustomerId()) ? conv.getStaffId() : conv.getCustomerId();
            map.put("otherUserId", otherUserId);
            
            User otherUser = userRepository.findById(otherUserId).orElse(null);
            if (otherUser != null) {
                map.put("otherUserName", otherUser.getFullName());
                map.put("otherUserEmail", otherUser.getEmail());
                map.put("otherUserRole", otherUser.getRole().name());
            }
            
            // Get last message in conversation
            List<MessageDTO> messages = messageService.getConversation(currentUserId, otherUserId);
            if (!messages.isEmpty()) {
                MessageDTO lastMsg = messages.get(messages.size() - 1);
                map.put("lastMessageText", lastMsg.getMessageText());
                map.put("lastMessageSenderId", lastMsg.getSenderId());
            } else {
                map.put("lastMessageText", "");
                map.put("lastMessageSenderId", null);
            }
            
            result.add(map);
        }
        
        return ResponseEntity.ok(result);
    }

    @PutMapping("/mark-read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu tin nhắn là đã đọc"));
    }

    @PutMapping("/mark-conversation-read/{otherUserId}")
    public ResponseEntity<?> markConversationAsRead(
            @PathVariable Long otherUserId,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getUserId();
        
        messageService.markConversationAsRead(currentUserId, otherUserId);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu toàn bộ hội thoại là đã đọc"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getUserId();
        
        Long count = messageService.getUnreadCount(currentUserId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getUserId();
        
        List<MessageDTO> messages = messageService.getUnreadMessages(currentUserId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/staff-list")
    public ResponseEntity<?> getStaffList() {
        List<User> staffList = userRepository.findByRole(UserRole.staff);
        List<User> adminList = userRepository.findByRole(UserRole.admin);
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (User u : staffList) {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", u.getUserId());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            result.add(map);
        }
        for (User u : adminList) {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", u.getUserId());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
