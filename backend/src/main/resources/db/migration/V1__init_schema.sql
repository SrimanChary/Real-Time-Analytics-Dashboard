-- V1__init_schema.sql
-- Initial database schema for Real-Time Analytics Dashboard

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(120) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (analytics ingestion)
CREATE TABLE events (
    id          BIGSERIAL PRIMARY KEY,
    event_type  VARCHAR(50)  NOT NULL,
    source      VARCHAR(100),
    payload     JSONB,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address  VARCHAR(45),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table (time-series data)
CREATE TABLE metrics (
    id          BIGSERIAL PRIMARY KEY,
    metric_key  VARCHAR(100) NOT NULL,
    value       NUMERIC(15, 4) NOT NULL,
    tags        JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    filters     JSONB,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_occurred ON events(occurred_at DESC);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_metrics_key ON metrics(metric_key);
CREATE INDEX idx_metrics_recorded ON metrics(recorded_at DESC);
CREATE INDEX idx_metrics_key_recorded ON metrics(metric_key, recorded_at DESC);
CREATE INDEX idx_reports_created_by ON reports(created_by);

-- Seed default admin user (password: Admin@123)
INSERT INTO users (username, email, password, role)
VALUES (
    'admin',
    'admin@analytics.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    'ROLE_ADMIN'
);

-- Seed sample demo user (password: Demo@123)
INSERT INTO users (username, email, password, role)
VALUES (
    'demo',
    'demo@analytics.com',
    '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77bqiiK',
    'ROLE_USER'
);

-- Seed sample metrics
INSERT INTO metrics (metric_key, value, tags, recorded_at)
SELECT
    'page_views',
    (random() * 500 + 100)::NUMERIC(15,4),
    '{"source": "web"}'::JSONB,
    NOW() - (s || ' minutes')::INTERVAL
FROM generate_series(1, 60) AS s;

INSERT INTO metrics (metric_key, value, tags, recorded_at)
SELECT
    'active_users',
    (random() * 200 + 50)::NUMERIC(15,4),
    '{"region": "us-east"}'::JSONB,
    NOW() - (s || ' minutes')::INTERVAL
FROM generate_series(1, 60) AS s;

INSERT INTO metrics (metric_key, value, tags, recorded_at)
SELECT
    'revenue',
    (random() * 10000 + 1000)::NUMERIC(15,4),
    '{"currency": "USD"}'::JSONB,
    NOW() - (s || ' hours')::INTERVAL
FROM generate_series(1, 48) AS s;

-- Seed sample events
INSERT INTO events (event_type, source, payload, occurred_at)
SELECT
    (ARRAY['click', 'pageview', 'purchase', 'signup', 'logout'])[floor(random()*5+1)::INT],
    (ARRAY['web', 'mobile', 'api'])[floor(random()*3+1)::INT],
    ('{"page": "/page-' || floor(random()*10+1)::INT || '"}')::JSONB,
    NOW() - (random() * 24 || ' hours')::INTERVAL
FROM generate_series(1, 100);
