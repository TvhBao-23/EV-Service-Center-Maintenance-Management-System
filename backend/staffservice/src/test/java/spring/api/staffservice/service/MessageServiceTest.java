package spring.api.staffservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MessageService messageService;

    private User customerUser;
    private User staffUser;
    private Message sampleMessage;
    private ChatConversation sampleConversation;

    @BeforeEach
    public void setUp() {
        customerUser = new User();
        customerUser.setUserId(1L);
        customerUser.setFullName("Nguyen Van A");
        customerUser.setEmail("customer@gmail.com");
        customerUser.setRole(UserRole.customer);

        staffUser = new User();
        staffUser.setUserId(2L);
        staffUser.setFullName("Tran Van B");
        staffUser.setEmail("staff@gmail.com");
        staffUser.setRole(UserRole.staff);

        sampleMessage = new Message();
        sampleMessage.setMessageId(100L);
        sampleMessage.setSenderId(1L);
        sampleMessage.setRecipientId(2L);
        sampleMessage.setMessageText("Hello Staff");
        sampleMessage.setIsRead(false);
        sampleMessage.setCreatedAt(LocalDateTime.now());

        sampleConversation = new ChatConversation();
        sampleConversation.setConversationId(200L);
        sampleConversation.setCustomerId(1L);
        sampleConversation.setStaffId(2L);
    }

    @Test
    public void testSendMessage_Success() {
        SendMessageRequest request = new SendMessageRequest();
        request.setRecipientId(2L);
        request.setMessageText("Hello Staff");
        request.setSubject("Support");

        when(messageRepository.save(any(Message.class))).thenReturn(sampleMessage);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));
        when(conversationRepository.findConversationBetweenUsers(1L, 2L)).thenReturn(Optional.of(sampleConversation));

        MessageDTO result = messageService.sendMessage(1L, request);

        assertNotNull(result);
        assertEquals(100L, result.getMessageId());
        assertEquals("Hello Staff", result.getMessageText());
        assertEquals("Nguyen Van A", result.getSenderName());
        assertEquals("Tran Van B", result.getRecipientName());

        verify(messageRepository, times(1)).save(any(Message.class));
        verify(conversationRepository, times(1)).save(any(ChatConversation.class));
    }

    @Test
    public void testGetConversation_Success() {
        when(messageRepository.findConversationBetweenUsers(1L, 2L)).thenReturn(Arrays.asList(sampleMessage));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));

        List<MessageDTO> result = messageService.getConversation(1L, 2L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Hello Staff", result.get(0).getMessageText());
    }

    @Test
    public void testGetUnreadMessages_Success() {
        when(messageRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(2L)).thenReturn(Arrays.asList(sampleMessage));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));

        List<MessageDTO> result = messageService.getUnreadMessages(2L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertFalse(result.get(0).getIsRead());
    }

    @Test
    public void testMarkAsRead_Success() {
        when(messageRepository.findById(100L)).thenReturn(Optional.of(sampleMessage));
        when(messageRepository.save(any(Message.class))).thenReturn(sampleMessage);

        messageService.markAsRead(100L);

        assertTrue(sampleMessage.getIsRead());
        verify(messageRepository, times(1)).save(sampleMessage);
    }

    @Test
    public void testMarkAsRead_NotFound() {
        when(messageRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> messageService.markAsRead(999L));
    }

    @Test
    public void testMarkConversationAsRead_Success() {
        Message unreadMessage1 = new Message();
        unreadMessage1.setMessageId(101L);
        unreadMessage1.setSenderId(1L);
        unreadMessage1.setRecipientId(2L); // target user is 2
        unreadMessage1.setIsRead(false);

        Message sentByTarget = new Message();
        sentByTarget.setMessageId(102L);
        sentByTarget.setSenderId(2L);
        sentByTarget.setRecipientId(1L);
        sentByTarget.setIsRead(false); // sent by target, shouldn't mark as read

        when(messageRepository.findConversationBetweenUsers(2L, 1L))
                .thenReturn(Arrays.asList(unreadMessage1, sentByTarget));

        messageService.markConversationAsRead(2L, 1L);

        assertTrue(unreadMessage1.getIsRead());
        assertFalse(sentByTarget.getIsRead());
        verify(messageRepository, times(1)).save(unreadMessage1);
        verify(messageRepository, never()).save(sentByTarget);
    }

    @Test
    public void testGetUnreadCount_Success() {
        when(messageRepository.countByRecipientIdAndIsReadFalse(2L)).thenReturn(5L);

        Long count = messageService.getUnreadCount(2L);

        assertEquals(5L, count);
        verify(messageRepository, times(1)).countByRecipientIdAndIsReadFalse(2L);
    }
}
