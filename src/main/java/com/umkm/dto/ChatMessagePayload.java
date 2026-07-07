package com.umkm.dto;

import lombok.Data;

@Data
public class ChatMessagePayload {
    private String content;
    private String senderRole; // Optionally provided by client, but should ideally be determined by session
}
