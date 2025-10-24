package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;

/**
 * Controller đơn giản để test Maintenance Service
 */
@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class SimpleMaintenanceController {

    @Autowired
    private DataSource dataSource;

    /**
     * GET /api/maintenance/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(new HealthResponse(
                "Maintenance Service is running",
                LocalDateTime.now(),
                "OK"));
    }

    /**
     * GET /api/maintenance/database/test
     * Test database connection
     */
    @GetMapping("/database/test")
    public ResponseEntity<?> testDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection != null && !connection.isClosed()) {
                String productName = connection.getMetaData().getDatabaseProductName();
                String version = connection.getMetaData().getDatabaseProductVersion();
                boolean isMariaDB = version.toLowerCase().contains("mariadb");

                String message = isMariaDB ? "MariaDB Database connection successful!"
                        : "MySQL Database connection successful!";

                return ResponseEntity.ok(new DatabaseTestResponse(
                        message,
                        true,
                        productName,
                        version,
                        isMariaDB,
                        connection.getCatalog(),
                        System.currentTimeMillis()));
            } else {
                return ResponseEntity.badRequest().body(new DatabaseTestResponse(
                        "Database connection failed: Connection is null or closed",
                        false,
                        null,
                        null,
                        false,
                        null,
                        System.currentTimeMillis()));
            }
        } catch (SQLException e) {
            return ResponseEntity.badRequest().body(new DatabaseTestResponse(
                    "Database connection failed: " + e.getMessage(),
                    false,
                    null,
                    null,
                    false,
                    null,
                    System.currentTimeMillis()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new DatabaseTestResponse(
                    "Unexpected error: " + e.getMessage(),
                    false,
                    null,
                    null,
                    false,
                    null,
                    System.currentTimeMillis()));
        }
    }

    // DTO Classes
    public static class HealthResponse {
        private String message;
        private LocalDateTime timestamp;
        private String status;

        public HealthResponse(String message, LocalDateTime timestamp, String status) {
            this.message = message;
            this.timestamp = timestamp;
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public String getStatus() {
            return status;
        }
    }

    public static class DatabaseTestResponse {
        private String message;
        private boolean success;
        private String databaseProductName;
        private String databaseVersion;
        private boolean isMariaDB;
        private String currentDatabase;
        private long timestamp;

        public DatabaseTestResponse(String message, boolean success, String databaseProductName,
                String databaseVersion, boolean isMariaDB, String currentDatabase, long timestamp) {
            this.message = message;
            this.success = success;
            this.databaseProductName = databaseProductName;
            this.databaseVersion = databaseVersion;
            this.isMariaDB = isMariaDB;
            this.currentDatabase = currentDatabase;
            this.timestamp = timestamp;
        }

        public String getMessage() {
            return message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getDatabaseProductName() {
            return databaseProductName;
        }

        public String getDatabaseVersion() {
            return databaseVersion;
        }

        public boolean isMariaDB() {
            return isMariaDB;
        }

        public String getCurrentDatabase() {
            return currentDatabase;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}
