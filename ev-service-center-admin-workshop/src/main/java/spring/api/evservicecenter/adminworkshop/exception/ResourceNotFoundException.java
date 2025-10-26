package spring.api.evservicecenter.adminworkshop.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception tùy chỉnh này sẽ được ném khi không tìm thấy một tài nguyên (ví dụ: User, Customer, Vehicle).
 *
 * @ResponseStatus(HttpStatus.NOT_FOUND) sẽ tự động khiến Spring Boot 
 * trả về lỗi 404 NOT FOUND cho client bất cứ khi nào Exception này được ném 
 * mà không bị bắt (catch) bởi GlobalExceptionHandler.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructor nhận một thông báo lỗi.
     * @param message Thông báo mô tả lỗi (ví dụ: "Customer not found")
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
