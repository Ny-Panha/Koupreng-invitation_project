package com.koupreng.backend.shared.persistence.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class KhmerCelestialMigrationTests {

    private static final Path SEED_MIGRATION = Path.of(
            "src/main/resources/db/migration/V22__seed_khmer_celestial_template.sql"
    );
    private static final Path VIDEO_MIGRATION = Path.of(
            "src/main/resources/db/migration/V23__enable_khmer_celestial_opening_video.sql"
    );

    @Test
    void keepsAppliedSeedStableAndAddsOpeningVideoForward() throws IOException {
        String seedSql = Files.readString(SEED_MIGRATION);
        String videoSql = Files.readString(VIDEO_MIGRATION);

        assertTrue(seedSql.contains("'khmer-celestial'"));
        assertFalse(seedSql.contains("openingVideoEnabled"));
        assertFalse(seedSql.contains("openingVideoUrl"));

        assertTrue(videoSql.contains("WHERE code = 'khmer-celestial'"));
        assertTrue(videoSql.contains("\"openingVideoEnabled\":true"));
        assertTrue(videoSql.contains("\"openingVideoUrl\":\"/invitations/khmer-celestial/burgundy-bokeh.mp4\""));
    }
}
