package spring.api.evservicecenter.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import spring.api.evservicecenter.dto.CustomerAdminViewDto;
import spring.api.evservicecenter.dto.CustomerRequestDto;
import spring.api.evservicecenter.model.Customer;
import spring.api.evservicecenter.service.CustomerAdminService;
import java.util.List;

@RestController
@RequestMapping("/api/admin/customers") // Đường dẫn cho trang admin
public class CustomerAdminController {

    @Autowired
    private CustomerAdminService customerAdminService;

    /**
     * API endpoint để lấy danh sách khách hàng cho trang quản lý.
     * Tương ứng với tab "Khách hàng & Xe".
     */
    @GetMapping
    public ResponseEntity<List<CustomerAdminViewDto>> getCustomerList() {
        List<CustomerAdminViewDto> customers = customerAdminService.getAllCustomersForAdmin();
        return ResponseEntity.ok(customers);
    }

    // THÊM (CREATE)
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody CustomerRequestDto requestDto) {
        Customer newCustomer = customerAdminService.createCustomer(requestDto);
        return new ResponseEntity<>(newCustomer, HttpStatus.CREATED);
    }

    // SỬA (UPDATE)
    @PutMapping("/{customerId}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long customerId, @RequestBody CustomerRequestDto requestDto) {
        Customer updatedCustomer = customerAdminService.updateCustomer(customerId, requestDto);
        return ResponseEntity.ok(updatedCustomer);
    }

    // XÓA (DELETE)
    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long customerId) {
        customerAdminService.deleteCustomer(customerId);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content
    }
}