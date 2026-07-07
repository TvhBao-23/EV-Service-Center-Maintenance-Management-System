package spring.api.customerservice.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureSubscriptionColumn() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.columns " +
                            "WHERE table_schema = DATABASE() " +
                            "AND table_name = 'payments' " +
                            "AND column_name = 'subscription_id'",
                    Integer.class);

            if (count == null || count == 0) {
                jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN subscription_id BIGINT NULL");
                log.info("Added subscription_id column to payments table");
            } else {
                log.info("subscription_id column already exists in payments table");
            }
        } catch (Exception e) {
            log.error("Failed to ensure subscription_id column", e);
        }
    }
}
