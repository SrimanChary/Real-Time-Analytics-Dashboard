package com.analytics.service;

import com.analytics.model.dto.*;
import com.analytics.model.entity.Event;
import com.analytics.model.entity.Metric;
import com.analytics.repository.EventRepository;
import com.analytics.repository.MetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final MetricsRepository metricsRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public KpiResponse getKpis(LocalDateTime from, LocalDateTime to) {
        try {
            long totalEvents = eventRepository.countByOccurredAtBetween(from, to);
            long activeUsers = eventRepository.countDistinctUsersBetween(from, to);
            BigDecimal revenue = metricsRepository.sumByKeyAndPeriod("revenue", from, to);
            BigDecimal avgVal  = metricsRepository.findAvgValueBetween(from, to);
            long pageViews = eventRepository.countByOccurredAtAfter(from);

            return KpiResponse.builder()
                .totalEvents(totalEvents)
                .activeUsers(activeUsers)
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .avgMetricValue(avgVal != null ? avgVal : BigDecimal.ZERO)
                .pageViews(pageViews)
                .period(Map.of("from", from.toString(), "to", to.toString()))
                .build();
        } catch (Exception e) {
            log.error("KPI error: {}", e.getMessage(), e);
            return KpiResponse.builder()
                .totalEvents(0).activeUsers(0)
                .totalRevenue(BigDecimal.ZERO)
                .avgMetricValue(BigDecimal.ZERO)
                .pageViews(0)
                .period(Map.of("from", from.toString(), "to", to.toString()))
                .build();
        }
    }

    public List<TimeSeriesPoint> getTimeSeries(
            String metricKey, LocalDateTime from, LocalDateTime to) {
        return metricsRepository.findByKeyAndPeriodOrdered(metricKey, from, to)
            .stream()
            .map(m -> TimeSeriesPoint.builder()
                .label(m.getRecordedAt().toString())
                .value(m.getValue())
                .timestamp(m.getRecordedAt())
                .build())
            .collect(Collectors.toList());
    }

    public List<EventTypeCount> getEventBreakdown(LocalDateTime from, LocalDateTime to) {
        return eventRepository.countByEventTypeGrouped(from, to).stream()
            .map(row -> EventTypeCount.builder()
                .eventType((String) row[0])
                .count((Long) row[1])
                .build())
            .collect(Collectors.toList());
    }

    @Transactional
    public EventResponse ingestEvent(EventRequest request) {
        Event event = Event.builder()
            .eventType(request.eventType)
            .source(request.source)
            .payload(request.payload)
            .occurredAt(LocalDateTime.now())
            .build();

        Event saved = eventRepository.save(event);

        messagingTemplate.convertAndSend(
            "/topic/events", EventNotification.from(saved));

        return EventResponse.builder()
            .id(saved.getId())
            .eventType(saved.getEventType())
            .source(saved.getSource())
            .occurredAt(saved.getOccurredAt())
            .build();
    }

    @Transactional
    public Metric recordMetric(MetricRequest request) {
        return metricsRepository.save(Metric.builder()
            .metricKey(request.metricKey)
            .value(request.value)
            .tags(request.tags)
            .recordedAt(LocalDateTime.now())
            .build());
    }

    public KpiSnapshot getLatestKpiSnapshot() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);
        long totalEvents = eventRepository.countByOccurredAtBetween(oneHourAgo, now);
        long activeUsers = eventRepository.countDistinctUsersBetween(oneHourAgo, now);
        Metric latestRevenue = metricsRepository.findLatestByKey("revenue", org.springframework.data.domain.PageRequest.of(0,1)).stream().findFirst().orElse(null);
        return KpiSnapshot.builder()
            .totalEvents(totalEvents)
            .activeUsers(activeUsers)
            .latestRevenue(latestRevenue != null ? latestRevenue.getValue() : BigDecimal.ZERO)
            .pageViews(eventRepository.countByOccurredAtAfter(oneHourAgo))
            .timestamp(now)
            .build();
    }
}
