package spring.api.evservicecenter.dto;


import lombok.Data;

@Data
public class CustomerRequestDTO {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String password; // Chỉ dùng khi tạo mới
}
