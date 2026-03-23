package com.analytics.model.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EventTypeCount {
    public String eventType;
    public long count;
}
