package spring.api.adminservice.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import spring.api.adminservice.service.DashboardService;
import spring.api.adminservice.service.DashboardService.Activities;
import spring.api.adminservice.service.DashboardService.Summary;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminDashboardController.class)
class AdminDashboardControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    void health_returnsOk() throws Exception {
        mvc.perform(get("/api/admin/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.service").value("adminservice"));
    }

    @Test
    void dashboard_delegatesToService() throws Exception {
        Summary s = new Summary();
        s.setTotalBookings(2);
        s.setTotalCustomers(1);
        when(dashboardService.getSummary()).thenReturn(s);

        mvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBookings").value(2))
                .andExpect(jsonPath("$.totalCustomers").value(1));
    }

    @Test
    void activities_delegatesToService() throws Exception {
        Activities a = new Activities();
        a.setRecentBookings(java.util.List.of());
        a.setRecentCompletedReceipts(java.util.List.of());
        when(dashboardService.getRecentActivities()).thenReturn(a);

        mvc.perform(get("/api/admin/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recentBookings").isArray());
    }

    @Test
    void staffCount_delegatesToService() throws Exception {
        when(dashboardService.getStaffCount()).thenReturn(5);

        mvc.perform(get("/api/admin/staff-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }
}

