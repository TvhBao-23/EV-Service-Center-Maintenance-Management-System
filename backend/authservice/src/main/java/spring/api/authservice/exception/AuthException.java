package spring.api.authservice.exception;

// [KCPM-43]: Tạo ngoại lệ tùy chỉnh AuthException để thay thế cho RuntimeException chung (khắc phục Code Smell java:S112)
public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}
