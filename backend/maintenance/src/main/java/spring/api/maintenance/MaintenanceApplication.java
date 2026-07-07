package spring.api.maintenance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for Maintenance Service
 * 
 * Chức năng chính:
 * - Tiếp nhận yêu cầu dịch vụ từ khách
 * - Lập phiếu bảo dưỡng
 * - Quản lý tiến trình: chờ – đang làm – hoàn tất
 * - Phân công kỹ thuật viên
 * - Quản lý công việc bảo dưỡng chi tiết
 * - Quản lý vật tư/sửa chữa
 */
@SpringBootApplication
public class MaintenanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaintenanceApplication.class, args);
    }

}