package com.analytics.controller;

import com.analytics.model.dto.EventNotification;
import com.analytics.model.dto.EventRequest;
import com.analytics.model.dto.KpiSnapshot;
import com.analytics.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
@Hidden
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AnalyticsService analyticsService;

    // Client sends to /app/ingest, result broadcast to /topic/events
    @MessageMapping("/ingest")
    @SendTo("/topic/events")
    public EventNotification handleIngest(EventRequest request) {
        var response = analyticsService.ingestEvent(request);
        return EventNotification.builder()
            .id(response.id)
            .eventType(response.eventType)
            .occurredAt(response.occurredAt)
            .build();
    }

    // ── Scheduled broadcasts ──────────────────────────────────

    // Broadcast live KPI snapshot every 5 seconds
    @Scheduled(fixedRate = 5000)
    public void broadcastKpis() {
        try {
            KpiSnapshot snapshot = analyticsService.getLatestKpiSnapshot();
            messagingTemplate.convertAndSend("/topic/kpis", snapshot);
        } catch (Exception e) {
            log.warn("KPI broadcast failed: {}", e.getMessage());
        }
    }

    // Broadcast event count every 10 seconds
    @Scheduled(fixedRate = 10000)
    public void broadcastEventCount() {
        try {
            long count = analyticsService.getLatestKpiSnapshot().totalEvents;
            messagingTemplate.convertAndSend("/topic/event-count",
                Map.of("count", count, "timestamp", LocalDateTime.now().toString()));
        } catch (Exception e) {
            log.warn("Event count broadcast failed: {}", e.getMessage());
        }
    }

    // Simulate live metric data every 8 seconds (demo purposes)
    @Scheduled(fixedRate = 8000)
    public void broadcastLiveMetric() {
        try {
            double value = 100 + Math.random() * 400;
            messagingTemplate.convertAndSend("/topic/metrics",
                Map.of(
                    "label", LocalDateTime.now().toString(),
                    "value", Math.round(value * 100.0) / 100.0,
                    "timestamp", LocalDateTime.now().toString()
                ));
        } catch (Exception e) {
            log.warn("Metric broadcast failed: {}", e.getMessage());
        }
    }
}
