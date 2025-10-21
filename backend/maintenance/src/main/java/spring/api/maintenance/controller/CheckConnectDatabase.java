package spring.api.maintenance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Controller để kiểm tra kết nối MySQL database
 */
@RestController
@RequestMapping("/api/database")
@CrossOrigin(origins = "*")
public class CheckConnectDatabase {

    @Autowired
    private DataSource dataSource;

    /**
     * GET /api/database/test - Kiểm tra kết nối MySQL database
     */
    @GetMapping("/test")
    public ResponseEntity<?> testDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            // Kiểm tra connection có active không
            if (connection != null && !connection.isClosed()) {
                String productName = connection.getMetaData().getDatabaseProductName();
                String version = connection.getMetaData().getDatabaseProductVersion();
                boolean isMySQL = productName.toLowerCase().contains("mysql");
                boolean isMariaDB = version.toLowerCase().contains("mariadb");

                String message = isMariaDB ? "MariaDB Database connection successful!"
                        : "MySQL Database connection successful!";

                return ResponseEntity.ok(new DatabaseTestResponse(
                        message,
                        true,
                        productName,
                        version,
                        isMySQL,
                        isMariaDB,
                        connection.getCatalog(), // Tên database hiện tại
                        System.currentTimeMillis()));
            } else {
                return ResponseEntity.badRequest().body(new DatabaseTestResponse(
                        "Database connection failed: Connection is null or closed",
                        false,
                        null,
                        null,
                        false,
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
                    false,
                    null,
                    System.currentTimeMillis()));
        }
    }

    /**
     * GET /api/database/info - Lấy thông tin database
     */
    @GetMapping("/info")
    public ResponseEntity<?> getDatabaseInfo() {
        try (Connection connection = dataSource.getConnection()) {
            return ResponseEntity.ok(new DatabaseInfoResponse(
                    connection.getMetaData().getDatabaseProductName(),
                    connection.getMetaData().getDatabaseProductVersion(),
                    connection.getMetaData().getDriverName(),
                    connection.getMetaData().getDriverVersion(),
                    connection.getCatalog(),
                    System.currentTimeMillis()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting database info: " + e.getMessage());
        }
    }

    // DTO Classes
    public static class DatabaseTestResponse {
        private String message;
        private boolean success;
        private String databaseProductName;
        private String databaseVersion;
        private boolean isMySQL;
        private boolean isMariaDB;
        private String currentDatabase;
        private long timestamp;

        public DatabaseTestResponse(String message, boolean success, String databaseProductName,
                String databaseVersion, boolean isMySQL, boolean isMariaDB, String currentDatabase, long timestamp) {
            this.message = message;
            this.success = success;
            this.databaseProductName = databaseProductName;
            this.databaseVersion = databaseVersion;
            this.isMySQL = isMySQL;
            this.isMariaDB = isMariaDB;
            this.currentDatabase = currentDatabase;
            this.timestamp = timestamp;
        }

        // Getters
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

        public boolean isMySQL() {
            return isMySQL;
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

    public static class DatabaseInfoResponse {
        private String databaseProductName;
        private String databaseVersion;
        private String driverName;
        private String driverVersion;
        private String catalog;
        private long timestamp;

        public DatabaseInfoResponse(String databaseProductName, String databaseVersion,
                String driverName, String driverVersion, String catalog, long timestamp) {
            this.databaseProductName = databaseProductName;
            this.databaseVersion = databaseVersion;
            this.driverName = driverName;
            this.driverVersion = driverVersion;
            this.catalog = catalog;
            this.timestamp = timestamp;
        }

        // Getters
        public String getDatabaseProductName() {
            return databaseProductName;
        }

        public String getDatabaseVersion() {
            return databaseVersion;
        }

        public String getDriverName() {
            return driverName;
        }

        public String getDriverVersion() {
            return driverVersion;
        }

        public String getCatalog() {
            return catalog;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}
