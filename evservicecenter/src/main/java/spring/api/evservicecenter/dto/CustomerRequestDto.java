package spring.api.evservicecenter.dto;

// DTO này nhận dữ liệu để tạo hoặc cập nhật khách hàng
public class CustomerRequestDto {

    private String name;
    private String email;
    private String password; // Chỉ dùng khi tạo mới, hoặc cập nhật mật khẩu
    private String address;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
