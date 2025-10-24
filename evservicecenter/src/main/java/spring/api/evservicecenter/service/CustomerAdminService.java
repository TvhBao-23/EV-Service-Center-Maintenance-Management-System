package spring.api.evservicecenter.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;

import spring.api.evservicecenter.dto.CustomerAdminViewDto;
import spring.api.evservicecenter.dto.CustomerRequestDto;
import spring.api.evservicecenter.model.Customer;
import spring.api.evservicecenter.repository.CustomerRepository;
import spring.api.evservicecenter.repository.UserRepository;


import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;

@Service
public class CustomerAdminService {
    @Autowired
    private CustomerRepository customerRepository;

    public List<CustomerAdminViewDto> getAllCustomersForAdmin() {
        return customerRepository.findCustomerAdminView();
    }

    @Transactional
    public Customer createCustomer(CustomerRequestDto requestDto) {
        // Tạo User trước
        User user = new User();
        user.setName(requestDto.getName());
        user.setEmail(requestDto.getEmail());
        user.setPassword(passwordEncoder.encode(requestDto.getPassword())); // Mã hóa mật khẩu
        // Bạn có thể set thêm role, is_active... nếu có
        User savedUser = userRepository.save(user);

        // Tạo Customer và liên kết với User
        Customer customer = new Customer();
        customer.setUser(savedUser);
        customer.setAddress(requestDto.getAddress());
        
        return customerRepository.save(customer);
    }

    // SỬA (UPDATE)
    @Transactional
    public Customer updateCustomer(Long customerId, CustomerRequestDto requestDto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));

        User user = customer.getUser();
        user.setName(requestDto.getName());
        user.setEmail(requestDto.getEmail());
        customer.setAddress(requestDto.getAddress()); // Giả sử address lưu ở User (nếu lưu ở Customer thì đổi)
        // Cập nhật mật khẩu nếu có
         if (requestDto.getPassword() != null && !requestDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
         }

         userRepository.save(user); // Lưu User
         return customerRepository.save(customer); // Lưu Customer
      }

    // XÓA (DELETE)
    @Transactional
    public void deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));
        
        // Nhờ có CascadeType.ALL, khi xóa Customer, User liên kết cũng sẽ bị xóa.
        // Tuy nhiên, logic chuẩn là xóa User, và Customer (đã thiết lập cascade) sẽ bị xóa theo.
        // Nhưng vì chúng ta tìm Customer từ customerId, nên ta sẽ xóa Customer
        // và User liên kết (nhờ OneToOne cascade)
        // Nếu OneToOne không cascade từ Customer -> User, bạn phải xóa User riêng
        
        customerRepository.delete(customer);
        
        // Nếu không dùng cascade, bạn phải làm thủ công:
        // User user = customer.getUser();
        // customerRepository.delete(customer);
        // userRepository.delete(user);
    }
}