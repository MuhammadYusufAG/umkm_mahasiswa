package com.umkm.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageDTO {
    private Long id;
    private Long orderId;
    private String senderRole;
    private String content;
    private LocalDateTime createdAt;
}
