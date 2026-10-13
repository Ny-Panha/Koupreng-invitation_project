package com.koupreng.backend.devmonitor.infrastructure;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DevSqlStatementTrackerTest {

    @BeforeEach
    void setUp() {
        DevSqlStatementTracker.startTrace();
    }

    @AfterEach
    void tearDown() {
        DevSqlStatementTracker.stopTrace();
    }

    @Test
    void capturesQueryCountAndDetectsNPlusOnePatterns() {
        DevSqlStatementTracker.recordQuery("select * from invitations where id = 1");
        DevSqlStatementTracker.recordQuery("select * from invitations where id = 2");
        DevSqlStatementTracker.recordQuery("select * from invitations where id = 3");

        DevSqlStatementTracker.TraceResult result = DevSqlStatementTracker.stopTrace();

        assertEquals(3, result.queryCount());
        assertTrue(result.nPlusOneDetected(), "Should detect N+1 pattern for 3 identical query templates");
        assertEquals(3, result.queries().size());
    }

    @Test
    void normalQueriesDoNotTriggerNPlusOne() {
        DevSqlStatementTracker.recordQuery("select * from invitations where id = 1");
        DevSqlStatementTracker.recordQuery("select * from users where id = 1");

        DevSqlStatementTracker.TraceResult result = DevSqlStatementTracker.stopTrace();

        assertEquals(2, result.queryCount());
        assertFalse(result.nPlusOneDetected(), "Different query templates should not trigger N+1 warning");
    }

    @Test
    void emptyTraceReturnsZero() {
        DevSqlStatementTracker.TraceResult result = DevSqlStatementTracker.stopTrace();
        assertEquals(0, result.queryCount());
        assertFalse(result.nPlusOneDetected());
    }
}

