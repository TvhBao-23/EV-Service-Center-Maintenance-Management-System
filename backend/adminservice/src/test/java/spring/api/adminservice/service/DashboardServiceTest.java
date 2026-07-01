package spring.api.adminservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void getSummary_returnsSummaryWhenAllServicesRespond() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/appointments"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[]{"appointment1", "appointment2"}));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/vehicles"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[]{"vehicle1"}));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/customers"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[]{"customer1", "customer2", "customer3"}));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/technicians"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[]{"technician1"}));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/parts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[]{
                        Map.of("stockQuantity", 2, "minStockLevel", 5),
                        Map.of("stockQuantity", 10, "minStockLevel", 5)
                }));
        when(restTemplate.getForEntity(eq("http://customerservice:8082/api/customers/payments/statistics"), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("totalRevenue", 5000, "pendingPayments", 1250)));

        DashboardService.Summary summary = dashboardService.getSummary();

        assertThat(summary.getTotalBookings()).isEqualTo(2);
        assertThat(summary.getTotalVehicles()).isEqualTo(1);
        assertThat(summary.getTotalCustomers()).isEqualTo(3);
        assertThat(summary.getTotalTechnicians()).isEqualTo(1);
        assertThat(summary.getTotalParts()).isEqualTo(2);
        assertThat(summary.getLowStockParts()).isEqualTo(1);
        assertThat(summary.getTotalRevenue()).isEqualTo(5000);
        assertThat(summary.getPendingPayments()).isEqualTo(1250);
    }

    @Test
    void getSummary_fallsBackToReceiptRevenueWhenPaymentStatsMissing() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/appointments"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/vehicles"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/customers"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/technicians"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/parts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[0]));
        when(restTemplate.getForEntity(eq("http://customerservice:8082/api/customers/payments/statistics"), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("totalRevenue", 0, "pendingPayments", 0)));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/service-receipts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[]{
                        Map.of("status", "done", "totalAmount", 1000),
                        Map.of("status", "completed", "amount", 500),
                        Map.of("status", "pending", "totalAmount", 400)
                }));

        DashboardService.Summary summary = dashboardService.getSummary();

        assertThat(summary.getTotalRevenue()).isEqualTo(1500);
        assertThat(summary.getPendingPayments()).isEqualTo(0);
    }

    @Test
    void getRecentActivities_sortsRecentBookingsAndReceipts() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/appointments"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[]{
                        Map.of("appointmentId", 1, "createdAt", "2026-06-24T12:00:00Z"),
                        Map.of("appointmentId", 2, "createdAt", "2026-06-24T14:00:00Z"),
                        Map.of("appointmentId", 3, "createdAt", "2026-06-24T10:00:00Z"),
                        Map.of("appointmentId", 4, "createdAt", "2026-06-24T16:00:00Z"),
                        Map.of("appointmentId", 5, "createdAt", "2026-06-24T09:00:00Z"),
                        Map.of("appointmentId", 6, "createdAt", "2026-06-24T15:00:00Z"),
                        Map.of("appointmentId", 7, "createdAt", "2026-06-24T13:00:00Z"),
                        Map.of("appointmentId", 8, "createdAt", "2026-06-24T11:00:00Z"),
                        Map.of("appointmentId", 9, "createdAt", "2026-06-24T08:00:00Z")
                }));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/service-receipts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[]{
                        Map.of("id", 11, "status", "done", "completedAt", "2026-06-24T17:00:00Z"),
                        Map.of("id", 12, "status", "completed", "completedAt", "2026-06-24T15:00:00Z"),
                        Map.of("id", 13, "status", "done", "completedAt", "2026-06-24T16:00:00Z"),
                        Map.of("id", 14, "status", "pending", "completedAt", "2026-06-24T18:00:00Z")
                }));

        DashboardService.Activities activities = dashboardService.getRecentActivities();

        assertThat(activities.getRecentBookings()).hasSize(8);
        assertThat(activities.getRecentBookings().get(0).get("appointmentId")).isEqualTo(4);
        assertThat(activities.getRecentBookings().get(1).get("appointmentId")).isEqualTo(6);
        assertThat(activities.getRecentBookings().get(2).get("appointmentId")).isEqualTo(2);
        assertThat(activities.getRecentCompletedReceipts()).hasSize(3);
        assertThat(activities.getRecentCompletedReceipts().get(0).get("id")).isEqualTo(11);
        assertThat(activities.getRecentCompletedReceipts().get(1).get("id")).isEqualTo(13);
        assertThat(activities.getRecentCompletedReceipts().get(2).get("id")).isEqualTo(12);
    }

    @Test
    void getStaffCount_returnsCountFromService() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/staff-count"), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("count", 7)));

        int count = dashboardService.getStaffCount();

        assertThat(count).isEqualTo(7);
    }

    @Test
    void getSummary_handlesDownstreamExceptions() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/appointments"), eq(Object[].class)))
                .thenThrow(new RuntimeException("downstream error"));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/vehicles"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/customers"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/technicians"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/parts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[0]));
        when(restTemplate.getForEntity(eq("http://customerservice:8082/api/customers/payments/statistics"), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("totalRevenue", 0, "pendingPayments", 0)));

        DashboardService.Summary summary = dashboardService.getSummary();

        // ensure downstream exception doesn't bubble and defaults are returned
        assertThat(summary.getTotalBookings()).isEqualTo(0);
        assertThat(summary.getTotalRevenue()).isEqualTo(0);
    }

    // --- BVA TEST CASES ---

    @Test
    void getSummary_bvaLowStockParts() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/appointments"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/vehicles"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/customers"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/technicians"), eq(Object[].class)))
                .thenReturn(ResponseEntity.ok(new Object[0]));
        when(restTemplate.getForEntity(eq("http://customerservice:8082/api/customers/payments/statistics"), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("totalRevenue", 0, "pendingPayments", 0)));

        // BVA Test cases for low stock: delta = stockQuantity - minStockLevel
        // max-: delta = -1 (stock = 4, min = 5) -> Tính là Low stock
        // max: delta = 0 (stock = 5, min = 5) -> Tính là Low stock
        // max+: delta = 1 (stock = 6, min = 5) -> An toàn
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/parts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[]{
                        Map.of("stockQuantity", 4, "minStockLevel", 5),
                        Map.of("stockQuantity", 5, "minStockLevel", 5),
                        Map.of("stockQuantity", 6, "minStockLevel", 5)
                }));

        DashboardService.Summary summary = dashboardService.getSummary();

        assertThat(summary.getTotalParts()).isEqualTo(3);
        assertThat(summary.getLowStockParts()).isEqualTo(2); // Chỉ có 2 phần tử đầu được tính
    }

    @Test
    void getRecentActivities_bvaLimitReceipts() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/appointments"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[0]));

        // BVA cho mảng hoá đơn hoàn thành bị cắt limit(3) -> Truyền vào 4 cái (vượt biên)
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/service-receipts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[]{
                        Map.of("id", 1, "status", "done", "completedAt", "2026-06-25T10:00:00Z"),
                        Map.of("id", 2, "status", "done", "completedAt", "2026-06-24T10:00:00Z"),
                        Map.of("id", 3, "status", "done", "completedAt", "2026-06-23T10:00:00Z"),
                        Map.of("id", 4, "status", "done", "completedAt", "2026-06-22T10:00:00Z")
                }));

        DashboardService.Activities activities = dashboardService.getRecentActivities();

        assertThat(activities.getRecentCompletedReceipts()).hasSize(3); // Bị cắt cứng ở 3
    }

    @Test
    void getRecentActivities_bvaParseTimestamp() {
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/service-receipts"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[0]));

        // BVA cho parseTimestamp: biên là 946684800000L
        // Nếu < biên -> Bị nhân 1000
        // Nếu >= biên -> Giữ nguyên
        when(restTemplate.getForEntity(eq("http://staffservice:8083/api/staff/appointments"), eq(Map[].class)))
                .thenReturn(ResponseEntity.ok(new Map[]{
                        Map.of("appointmentId", 1, "createdAt", 946684799999L), // Bị nhân 1000 -> Số to nhất
                        Map.of("appointmentId", 2, "createdAt", 946684800000L), // Tại biên -> Giữ nguyên (Số bé nhất)
                        Map.of("appointmentId", 3, "createdAt", 946684800001L)  // Giữ nguyên (Số nhì)
                }));

        DashboardService.Activities activities = dashboardService.getRecentActivities();

        // Kiểm tra thứ tự sắp xếp giảm dần (DESC) để chứng minh hàm parse đúng
        assertThat(activities.getRecentBookings()).hasSize(3);
        assertThat(activities.getRecentBookings().get(0).get("appointmentId")).isEqualTo(1); // To nhất do bị nhân 1000
        assertThat(activities.getRecentBookings().get(1).get("appointmentId")).isEqualTo(3);
        assertThat(activities.getRecentBookings().get(2).get("appointmentId")).isEqualTo(2);
    }
}
