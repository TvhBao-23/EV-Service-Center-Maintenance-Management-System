package spring.api.staffservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Long recipientId;
    private String subject;
    private String messageText;
    private Long parentMessageId;
}

