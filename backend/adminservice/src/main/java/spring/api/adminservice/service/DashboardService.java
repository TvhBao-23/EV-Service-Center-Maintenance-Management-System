package spring.api.adminservice.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    private final RestTemplate restTemplate;

    // Call services directly (service-to-service communication within Docker
    // network)
    private static final String STAFF_BASE = "http://staffservice:8083/api/staff";
    private static final String CUSTOMER_BASE = "http://customerservice:8082/api/customers";
    private static final String PAYMENT_BASE = "http://paymentservice:8084/api/payments";
    private static final String MAINTENANCE_BASE = "http://maintenanceservice:8080/api/maintenance";

    public Summary getSummary() {
        Summary s = new Summary();

        try {
            // Appointments
            log.info("Fetching appointments from: {}/appointments", STAFF_BASE);
            List<?> appointments = getList(STAFF_BASE + "/appointments");
            s.setTotalBookings(appointments.size());
            log.info("Found {} appointments", appointments.size());
        } catch (Exception e) {
            log.error("Error fetching appointments: {}", e.getMessage(), e);
        }

        try {
            // Vehicles (from staffservice)
            log.info("Fetching vehicles from: {}/vehicles", STAFF_BASE);
            List<?> vehicles = getList(STAFF_BASE + "/vehicles");
            s.setTotalVehicles(vehicles.size());
            log.info("Found {} vehicles", vehicles.size());
        } catch (Exception e) {
            log.error("Error fetching vehicles: {}", e.getMessage(), e);
        }

        try {
            // Customers (from staffservice)
            log.info("Fetching customers from: {}/customers", STAFF_BASE);
            List<?> customers = getList(STAFF_BASE + "/customers");
            s.setTotalCustomers(customers.size());
            log.info("Found {} customers", customers.size());
        } catch (Exception e) {
            log.error("Error fetching customers: {}", e.getMessage(), e);
        }

        try {
            // Technicians
            log.info("Fetching technicians from: {}/technicians", STAFF_BASE);
            List<?> technicians = getList(STAFF_BASE + "/technicians");
            s.setTotalTechnicians(technicians.size());
            log.info("Found {} technicians", technicians.size());
        } catch (Exception e) {
            log.error("Error fetching technicians: {}", e.getMessage(), e);
        }

        try {
            // Parts
            log.info("Fetching parts from: {}/parts", STAFF_BASE);
            List<Map> parts = getListMap(STAFF_BASE + "/parts");
            s.setTotalParts(parts.size());
            long lowStock = parts.stream().filter(p -> {
                Number stock = (Number) p.getOrDefault("stockQuantity", 0);
                Number minStock = (Number) p.getOrDefault("minStockLevel", 0);
                return stock.intValue() <= minStock.intValue();
            }).count();
            s.setLowStockParts((int) lowStock);
            log.info("Found {} parts, {} low stock", parts.size(), lowStock);
        } catch (Exception e) {
            log.error("Error fetching parts: {}", e.getMessage(), e);
        }

        try {
            // Payment Statistics (Revenue and Pending Payments)
            log.info("Fetching payment statistics from: {}/payments/statistics", CUSTOMER_BASE);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> paymentStats = restTemplate.getForEntity(
                    CUSTOMER_BASE + "/payments/statistics", Map.class);
            if (paymentStats.getBody() != null) {
                Map<String, Object> stats = (Map<String, Object>) paymentStats.getBody();
                Object revenueObj = stats.get("totalRevenue");
                Object pendingObj = stats.get("pendingPayments");
                s.setTotalRevenue(revenueObj instanceof Number ? ((Number) revenueObj).longValue() : 0L);
                s.setPendingPayments(pendingObj instanceof Number ? ((Number) pendingObj).longValue() : 0L);
                log.info("Found totalRevenue: {}, pendingPayments: {}", s.getTotalRevenue(), s.getPendingPayments());
            }
        } catch (Exception e) {
            log.error("Error fetching payment statistics: {}", e.getMessage(), e);
        }

        // Fallback: compute revenue from service receipts when not provided
        if (s.getTotalRevenue() == 0) {
            try {
                log.info("Computing revenue from service receipts: {}/service-receipts", STAFF_BASE);
                List<Map> receipts = getListMap(STAFF_BASE + "/service-receipts");
                long computedRevenue = receipts.stream()
                        .filter(r -> {
                            Object status = r.get("status");
                            String st = status == null ? "" : String.valueOf(status).toLowerCase();
                            return "done".equals(st) || "completed".equals(st)
                                    || "hoàn tất".equalsIgnoreCase(String.valueOf(status));
                        })
                        .mapToLong(r -> {
                            Object amount = r.get("totalAmount");
                            if (amount instanceof Number n)
                                return n.longValue();
                            amount = r.getOrDefault("total", r.getOrDefault("cost", r.getOrDefault("amount", 0)));
                            return amount instanceof Number n2 ? n2.longValue() : 0L;
                        })
                        .sum();
                s.setTotalRevenue(computedRevenue);
                log.info("Computed revenue from receipts: {}", computedRevenue);
            } catch (Exception e) {
                log.error("Error computing revenue from receipts: {}", e.getMessage(), e);
            }
        }

        return s;
    }

    public Activities getRecentActivities() {
        Activities a = new Activities();
        try {
            log.info("Fetching recent bookings from: {}/appointments", STAFF_BASE);
            List<Map> bookings = getListMap(STAFF_BASE + "/appointments");
            log.info("Fetched {} total bookings from staff service", bookings.size());

            // Sort by created_at or createdAt DESC (newest first), then limit to 8
            // (increased from 5)
            // Priority: createdAt > created_at > appointmentDate
            a.setRecentBookings(bookings.stream()
                    .sorted((b1, b2) -> {
                        // Try to get timestamp from various fields (prioritize createdAt/created_at)
                        Object time1 = b1.getOrDefault("createdAt", b1.getOrDefault("created_at",
                                b1.getOrDefault("appointmentDate", b1.getOrDefault("requested_date_time", null))));
                        Object time2 = b2.getOrDefault("createdAt", b2.getOrDefault("created_at",
                                b2.getOrDefault("appointmentDate", b2.getOrDefault("requested_date_time", null))));

                        // Compare timestamps (newest first = descending)
                        if (time1 == null && time2 == null)
                            return 0;
                        if (time1 == null)
                            return 1; // null goes to end
                        if (time2 == null)
                            return -1;

                        // Try to parse as timestamp (milliseconds or ISO string)
                        long ts1 = parseTimestamp(time1);
                        long ts2 = parseTimestamp(time2);
                        return Long.compare(ts2, ts1); // DESC order
                    })
                    .limit(8) // Increased from 5 to show more recent activities
                    .toList());

            // Log the appointment IDs that were selected
            List<Object> selectedIds = a.getRecentBookings().stream()
                    .map(b -> b.get("appointmentId") != null ? b.get("appointmentId")
                            : b.get("appointment_id") != null ? b.get("appointment_id") : b.get("id"))
                    .toList();
            log.info("Found {} recent bookings (sorted by createdAt DESC). Selected IDs: {}",
                    a.getRecentBookings().size(), selectedIds);
        } catch (Exception e) {
            log.error("Error fetching bookings: {}", e.getMessage(), e);
            a.setRecentBookings(List.of());
        }
        try {
            log.info("Fetching service receipts from: {}/service-receipts", STAFF_BASE);
            List<Map> receipts = getListMap(STAFF_BASE + "/service-receipts");
            a.setRecentCompletedReceipts(
                    receipts.stream()
                            .filter(r -> {
                                Object status = r.get("status");
                                String st = status == null ? "" : String.valueOf(status).toLowerCase();
                                return "done".equals(st) || "completed".equals(st)
                                        || "hoàn tất".equalsIgnoreCase(String.valueOf(status));
                            })
                            .sorted((r1, r2) -> {
                                // Sort by completedAt or updatedAt DESC (newest first)
                                Object time1 = r1.getOrDefault("completedAt", r1.getOrDefault("completed_at",
                                        r1.getOrDefault("updatedAt", r1.getOrDefault("updated_at",
                                                r1.getOrDefault("date", null)))));
                                Object time2 = r2.getOrDefault("completedAt", r2.getOrDefault("completed_at",
                                        r2.getOrDefault("updatedAt", r2.getOrDefault("updated_at",
                                                r2.getOrDefault("date", null)))));

                                if (time1 == null && time2 == null)
                                    return 0;
                                if (time1 == null)
                                    return 1;
                                if (time2 == null)
                                    return -1;

                                long ts1 = parseTimestamp(time1);
                                long ts2 = parseTimestamp(time2);
                                return Long.compare(ts2, ts1); // DESC order
                            })
                            .limit(3)
                            .toList());
            log.info("Found {} recent completed receipts (sorted by date)", a.getRecentCompletedReceipts().size());
        } catch (Exception e) {
            log.error("Error fetching receipts: {}", e.getMessage());
            a.setRecentCompletedReceipts(List.of());
        }
        return a;
    }

    /**
     * Parse timestamp from various formats (Long, String ISO, etc.)
     */
    private long parseTimestamp(Object timeObj) {
        if (timeObj == null)
            return 0L;

        // If it's already a Number (Long, Integer, etc.)
        if (timeObj instanceof Number) {
            long num = ((Number) timeObj).longValue();
            // If it's in seconds (less than year 2000 in milliseconds), convert to
            // milliseconds
            if (num < 946684800000L) { // Jan 1, 2000 in milliseconds
                return num * 1000;
            }
            return num;
        }

        // If it's a String, try to parse as ISO date string
        if (timeObj instanceof String) {
            String timeStr = (String) timeObj;
            try {
                // Try parsing as ISO 8601 date string
                return java.time.Instant.parse(timeStr).toEpochMilli();
            } catch (Exception e) {
                // If parsing fails, try as long string
                try {
                    return Long.parseLong(timeStr);
                } catch (NumberFormatException ex) {
                    log.warn("Could not parse timestamp: {}", timeStr);
                    return 0L;
                }
            }
        }

        return 0L;
    }

    public int getStaffCount() {
        try {
            log.info("Fetching staff count from: {}/staff-count", STAFF_BASE);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> resp = restTemplate.getForEntity(STAFF_BASE + "/staff-count", Map.class);
            Object body = resp.getBody() != null ? ((Map<String, Object>) resp.getBody()).get("count") : 0;
            return body instanceof Number n ? n.intValue() : Integer.parseInt(String.valueOf(body));
        } catch (Exception e) {
            log.error("Error fetching staff count: {}", e.getMessage());
            return 0;
        }
    }

    private List<?> getList(String url) {
        try {
            ResponseEntity<Object[]> resp = restTemplate.getForEntity(url, Object[].class);
            return Arrays.asList(resp.getBody() != null ? resp.getBody() : new Object[0]);
        } catch (Exception e) {
            log.error("Error calling {}: {}", url, e.getMessage());
            throw e;
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map> getListMap(String url) {
        try {
            ResponseEntity<Map[]> resp = restTemplate.getForEntity(url, Map[].class);
            return Arrays.asList(resp.getBody() != null ? resp.getBody() : new Map[0]);
        } catch (Exception e) {
            log.error("Error calling {}: {}", url, e.getMessage());
            throw e;
        }
    }

    @Data
    public static class Summary {
        private int totalCustomers;
        private int totalTechnicians;
        private int totalVehicles;
        private int totalBookings;
        private int totalParts;
        private int lowStockParts;
        private long totalRevenue; // optional, default 0
        private long pendingPayments; // optional, default 0
    }

    @Data
    public static class Activities {
        private List<Map> recentBookings;
        private List<Map> recentCompletedReceipts;
    }
}
