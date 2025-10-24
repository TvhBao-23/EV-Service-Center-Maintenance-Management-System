package spring.api.evservicecenter.model;

import jakarta.persistence.*;


@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name = "string_name")
    private String name;

    @Column(name = "string_email")
    private String email;

    // ... các trường khác và getters/setters

    @Column(name = "string_password_hash") // Tên cột trong database từ ERD
    private String password;

    @Column(name = "string_phone")
    private String phone;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password; // <-- Hàm này đang bị thiếu
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}