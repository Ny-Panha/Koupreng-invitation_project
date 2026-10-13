package com.koupreng.backend.devmonitor.infrastructure;

import org.hibernate.resource.jdbc.spi.StatementInspector;

/**
 * Hibernate StatementInspector hooked into the SessionFactory to record executed SQL queries.
 */
public class DevSqlStatementInspector implements StatementInspector {

    @Override
    public String inspect(String sql) {
        DevSqlStatementTracker.recordQuery(sql);
        return sql;
    }
}

