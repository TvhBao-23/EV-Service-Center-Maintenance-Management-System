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
        // Output standard structured logs without exposing the raw OTP value in production logs
        log.info("--------------------------------------------------");
        log.info("🔐 Password Reset OTP generated for: {}", toEmail);
        log.info("👤 User: {}", fullName);
        log.info("💡 (Development Mode) Check console or database for OTP verification.");
        log.info("--------------------------------------------------");
        
        log.info("✅ Password reset OTP generated and stored successfully for: {}", toEmail);
        
        // Try to send email if mail server is configured
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác nhận đặt lại mật khẩu - EV Service Center");
            
            // [KCPM-44]: Sử dụng Java Text Blocks giúp viết giao diện chuỗi HTML/Text dài dễ đọc hơn
            String emailBody = String.format(
                """
                Xin chào %s,

                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản EV Service Center.

                Mã xác nhận của bạn là: %s

                Mã này có hiệu lực trong 15 phút.

                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

                ⚠️ CẢNH BÁO: KHÔNG chia sẻ mã này với bất kỳ ai!

                Trân trọng,
                EV Service Center
                Hotline: 0772051289""",
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
                """
                Xin chào %s,

                Mật khẩu của bạn đã được thay đổi thành công.

                Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với chúng tôi:
                - Hotline: 0772051289
                - Email: support@evservicecenter.com

                Để bảo vệ tài khoản của bạn, chúng tôi khuyến nghị:
                ✓ Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số)
                ✓ Không sử dụng lại mật khẩu từ các tài khoản khác
                ✓ Thay đổi mật khẩu định kỳ

                Trân trọng,
                Đội ngũ EV Service Center""",
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
                """
                Xin chào %s,

                ⚠️ CẢNH BÁO BẢO MẬT

                Chúng tôi phát hiện có %d lần thử đặt lại mật khẩu cho tài khoản của bạn.

                Nếu đây KHÔNG PHẢI là bạn:
                1. Tài khoản của bạn có thể đang bị tấn công
                2. Vui lòng đổi mật khẩu ngay lập tức
                3. Liên hệ với chúng tôi: 0772051289

                Nếu đây là bạn:
                - Vui lòng sử dụng đúng email đã đăng ký
                - Kiểm tra hộp thư spam/junk

                Trân trọng,
                Đội ngũ EV Service Center""",
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
