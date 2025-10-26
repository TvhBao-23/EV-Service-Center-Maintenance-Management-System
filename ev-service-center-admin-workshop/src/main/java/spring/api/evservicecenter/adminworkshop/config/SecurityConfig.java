package spring.api.evservicecenter.adminworkshop.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Định nghĩa bean mã hóa mật khẩu
        // Giờ đây Spring đã biết cách tạo ra PasswordEncoder
        return new BCryptPasswordEncoder();
    }
}