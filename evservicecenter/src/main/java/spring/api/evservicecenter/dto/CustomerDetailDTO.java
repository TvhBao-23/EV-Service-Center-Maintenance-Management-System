package spring.api.evservicecenter.dto;

import spring.api.evservicecenter.entity.Vehicle;

import lombok.Data;

import java.util.List;

@Data
public class CustomerDetailDTO {
    // Thông tin từ CustomerResponseDTO
    private Integer customerId;
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Boolean isActive;
    
    // Danh sách xe chi tiết
    private List<Vehicle> vehicles; 
    // Giả sử 'Vehicle' là lớp Entity của bạn
    // Bạn cũng có thể tạo một VehicleResponseDTO riêng
}