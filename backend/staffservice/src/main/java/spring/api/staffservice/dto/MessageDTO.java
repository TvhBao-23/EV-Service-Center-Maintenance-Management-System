package spring.api.staffservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long messageId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private Long recipientId;
    private String recipientName;
    private String recipientEmail;
    private String subject;
    private String messageText;
    private Boolean isRead;
    private Long parentMessageId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

