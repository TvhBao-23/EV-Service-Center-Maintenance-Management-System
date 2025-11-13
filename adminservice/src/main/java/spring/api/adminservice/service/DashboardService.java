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
            a.setRecentBookings(bookings.stream().limit(5).toList());
        } catch (Exception e) {
            log.error("Error fetching bookings: {}", e.getMessage());
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
                            .limit(3)
                            .toList());
        } catch (Exception e) {
            log.error("Error fetching receipts: {}", e.getMessage());
            a.setRecentCompletedReceipts(List.of());
        }
        return a;
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
