package com.koupreng.backend.shared.persistence.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertTrue;

class FlywayMigrationVersionTests {

    private static final Pattern MIGRATION_NAME = Pattern.compile("^V([^_]+)__.+\\.sql$");

    @Test
    void versionedFlywayMigrationsUseUniqueVersions() throws IOException {
        Path migrationDir = Path.of("src/main/resources/db/migration");
        Map<String, List<String>> byVersion = new LinkedHashMap<>();

        try (var paths = Files.list(migrationDir)) {
            paths.map(path -> path.getFileName().toString())
                    .map(this::migrationVersion)
                    .filter(entry -> entry != null)
                    .forEach(entry -> byVersion.merge(
                            entry.version(),
                            List.of(entry.fileName()),
                            (left, right) -> {
                                java.util.ArrayList<String> merged = new java.util.ArrayList<>(left);
                                merged.addAll(right);
                                return merged;
                            }
                    ));
        }

        Map<String, List<String>> duplicates = new LinkedHashMap<>();
        byVersion.forEach((version, files) -> {
            if (files.size() > 1) {
                duplicates.put(version, files);
            }
        });

        assertTrue(duplicates.isEmpty(), "Duplicate Flyway migration versions: " + duplicates);
    }

    private MigrationFile migrationVersion(String fileName) {
        Matcher matcher = MIGRATION_NAME.matcher(fileName);
        if (!matcher.matches()) {
            return null;
        }
        return new MigrationFile(matcher.group(1), fileName);
    }

    private record MigrationFile(String version, String fileName) {
    }
}
