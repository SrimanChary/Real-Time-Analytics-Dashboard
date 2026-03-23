package com.analytics.model.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EventResponse {
    public Long id;
    public String eventType;
    public String source;
    public LocalDateTime occurredAt;
}
