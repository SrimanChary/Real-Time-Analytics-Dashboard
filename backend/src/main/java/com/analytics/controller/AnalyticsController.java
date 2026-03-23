package com.analytics.controller;

import com.analytics.model.dto.*;
import com.analytics.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Analytics", description = "KPIs, time-series metrics, events, and reports")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/kpis")
    @Operation(summary = "Get dashboard KPI summary")
    public ResponseEntity<KpiResponse> getKpis(
        @RequestParam(defaultValue = "#{T(java.time.LocalDateTime).now().minusDays(7)}")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam(defaultValue = "#{T(java.time.LocalDateTime).now()}")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(analyticsService.getKpis(from, to));
    }

    @GetMapping("/metrics/timeseries")
    @Operation(summary = "Get time-series data for a metric key")
    public ResponseEntity<List<TimeSeriesPoint>> getTimeSeries(
        @RequestParam(defaultValue = "page_views") String metricKey,
        @RequestParam(defaultValue = "#{T(java.time.LocalDateTime).now().minusHours(24)}")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam(defaultValue = "#{T(java.time.LocalDateTime).now()}")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(analyticsService.getTimeSeries(metricKey, from, to));
    }

    @GetMapping("/events/breakdown")
    @Operation(summary = "Get event count grouped by event type")
    public ResponseEntity<List<EventTypeCount>> getEventBreakdown(
        @RequestParam(defaultValue = "#{T(java.time.LocalDateTime).now().minusDays(7)}")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam(defaultValue = "#{T(java.time.LocalDateTime).now()}")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(analyticsService.getEventBreakdown(from, to));
    }

    @PostMapping("/events")
    @Operation(summary = "Ingest a new analytics event (also broadcasts via WebSocket)")
    public ResponseEntity<EventResponse> ingestEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(analyticsService.ingestEvent(request));
    }

    @PostMapping("/metrics")
    @Operation(summary = "Record a metric value")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> recordMetric(@Valid @RequestBody MetricRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(analyticsService.recordMetric(request));
    }
}
