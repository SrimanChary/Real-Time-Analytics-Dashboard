package com.analytics.model.dto;
import com.analytics.model.entity.Event;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EventNotification {
    public Long id;
    public String eventType;
    public LocalDateTime occurredAt;
    public static EventNotification from(Event e) {
        return EventNotification.builder()
            .id(e.getId()).eventType(e.getEventType()).occurredAt(e.getOccurredAt()).build();
    }
}
