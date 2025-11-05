package spring.api.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@evservicecenter.com}")
    private String fromEmail;

    /**
     * Gửi email chứa mã OTP để reset password
     */
    public void sendPasswordResetEmail(String toEmail, String token, String fullName) {
        // Display OTP in console - Simple and practical approach
        System.out.println("\n" + "=".repeat(70));
        System.out.println("  🔐 MÃ ĐẶT LẠI MẬT KHẨU (PASSWORD RESET OTP)");
        System.out.println("=".repeat(70));
        System.out.println("  📧 Email       : " + toEmail);
        System.out.println("  👤 Người dùng  : " + fullName);
        System.out.println("  🔢 MÃ OTP      : " + token);
        System.out.println("  ⏰ Hiệu lực    : 15 phút");
        System.out.println("=".repeat(70));
        System.out.println("  💡 Copy mã OTP và gửi cho người dùng qua Email/SMS/Zalo");
        System.out.println("=".repeat(70) + "\n");
        
        log.info("✅ Password reset OTP generated for: {} - OTP: {}", toEmail, token);
        
        // Try to send email if mail server is configured
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác nhận đặt lại mật khẩu - EV Service Center");
            
            String emailBody = String.format(
                "Xin chào %s,\n\n" +
                "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản EV Service Center.\n\n" +
                "Mã xác nhận của bạn là: %s\n\n" +
                "Mã này có hiệu lực trong 15 phút.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                "⚠️ CẢNH BÁO: KHÔNG chia sẻ mã này với bất kỳ ai!\n\n" +
                "Trân trọng,\n" +
                "EV Service Center\n" +
                "Hotline: 0772051289",
                fullName, token
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            log.info("📧 Email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.warn("⚠️  Email sending failed (mail server not configured). Use OTP from console above.");
        }
    }

    /**
     * Gửi email xác nhận sau khi đổi mật khẩu thành công
     */
    public void sendPasswordChangedNotification(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mật khẩu đã được thay đổi - EV Service Center");
            
            String emailBody = String.format(
                "Xin chào %s,\n\n" +
                "Mật khẩu của bạn đã được thay đổi thành công.\n\n" +
                "Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với chúng tôi:\n" +
                "- Hotline: 0772051289\n" +
                "- Email: support@evservicecenter.com\n\n" +
                "Để bảo vệ tài khoản của bạn, chúng tôi khuyến nghị:\n" +
                "✓ Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số)\n" +
                "✓ Không sử dụng lại mật khẩu từ các tài khoản khác\n" +
                "✓ Thay đổi mật khẩu định kỳ\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ EV Service Center",
                fullName
            );
            
            message.setText(emailBody);
            
            mailSender.send(message);
            log.info("Password changed notification sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send password changed notification to: {}", toEmail, e);
        }
    }

    /**
     * Gửi email cảnh báo về nhiều lần thử reset password
     */
    public void sendSecurityAlert(String toEmail, String fullName, int attemptCount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("⚠️ Cảnh báo bảo mật - EV Service Center");
            
            String emailBody = String.format(
                "Xin chào %s,\n\n" +
                "⚠️ CẢNH BÁO BẢO MẬT\n\n" +
                "Chúng tôi phát hiện có %d lần thử đặt lại mật khẩu cho tài khoản của bạn.\n\n" +
                "Nếu đây KHÔNG PHẢI là bạn:\n" +
                "1. Tài khoản của bạn có thể đang bị tấn công\n" +
                "2. Vui lòng đổi mật khẩu ngay lập tức\n" +
                "3. Liên hệ với chúng tôi: 0772051289\n\n" +
                "Nếu đây là bạn:\n" +
                "- Vui lòng sử dụng đúng email đã đăng ký\n" +
                "- Kiểm tra hộp thư spam/junk\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ EV Service Center",
                fullName, attemptCount
            );
            
            message.setText(emailBody);
            
            mailSender.send(message);
            log.info("Security alert sent to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send security alert to: {}", toEmail, e);
        }
    }
}

