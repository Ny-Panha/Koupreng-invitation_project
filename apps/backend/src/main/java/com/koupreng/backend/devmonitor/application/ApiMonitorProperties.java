package com.koupreng.backend.devmonitor.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.dev-monitor")
public class ApiMonitorProperties {

    private boolean enabled = true;
    private int maxEvents = 1000;
    private int maxSubscribers = 10;
    private long slowThresholdMs = 500;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getMaxEvents() {
        return maxEvents;
    }

    public void setMaxEvents(int maxEvents) {
        this.maxEvents = Math.max(1, Math.min(10000, maxEvents));
    }

    public int getMaxSubscribers() {
        return maxSubscribers;
    }

    public void setMaxSubscribers(int maxSubscribers) {
        this.maxSubscribers = Math.max(1, Math.min(100, maxSubscribers));
    }

    public long getSlowThresholdMs() {
        return slowThresholdMs;
    }

    public void setSlowThresholdMs(long slowThresholdMs) {
        this.slowThresholdMs = Math.max(1, slowThresholdMs);
    }
}

