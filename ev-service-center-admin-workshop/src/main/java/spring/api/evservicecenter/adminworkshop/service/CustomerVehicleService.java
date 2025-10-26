package spring.api.evservicecenter.adminworkshop.service;


import spring.api.evservicecenter.adminworkshop.dto.CustomerDetailDTO;
import spring.api.evservicecenter.adminworkshop.dto.CustomerRequestDTO;
import spring.api.evservicecenter.adminworkshop.dto.CustomerResponseDTO;
import spring.api.evservicecenter.adminworkshop.dto.VehicleRequestDTO;
import spring.api.evservicecenter.adminworkshop.entity.Customer;
import spring.api.evservicecenter.adminworkshop.entity.User;
import spring.api.evservicecenter.adminworkshop.entity.Vehicle;
import spring.api.evservicecenter.adminworkshop.enums.UserRole;
import spring.api.evservicecenter.adminworkshop.exception.ResourceNotFoundException;
import spring.api.evservicecenter.adminworkshop.repository.CustomerRepository;
import spring.api.evservicecenter.adminworkshop.repository.UserRepository;
import spring.api.evservicecenter.adminworkshop.repository.VehicleRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// (Import các DTO, Entity, Repository và PasswordEncoder)

@Service
public class CustomerVehicleService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Tiêm từ Spring Security

    // === QUẢN LÝ KHÁCH HÀNG ===

    public List<CustomerResponseDTO> getAllCustomers() {
        return customerRepository.findAllCustomerSummaries();
    }

    public CustomerDetailDTO getCustomerDetails(Integer customerId) {
        Customer customer = customerRepository.findCustomerDetailsById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        // Map Entity sang CustomerDetailDTO (ví dụ dùng ModelMapper hoặc thủ công)
        CustomerDetailDTO dto = new CustomerDetailDTO();
        dto.setCustomerId(customer.getCustomerId());
        dto.setUserId(customer.getUser().getUserId());
        dto.setFullName(customer.getUser().getFullName());
        dto.setEmail(customer.getUser().getEmail());
        dto.setPhone(customer.getUser().getPhone());
        dto.setAddress(customer.getAddress());
        dto.setIsActive(customer.getUser().getIsActive());
        dto.setVehicles(customer.getVehicles());
        return dto;
    }

    @Transactional
    public Customer createCustomer(CustomerRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        // 1. Tạo User
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(UserRole.customer);// Từ ENUM
        user.setIsActive(true);
        User savedUser = userRepository.save(user);

        // 2. Tạo Customer
        Customer customer = new Customer();
        customer.setUser(savedUser);
        customer.setAddress(dto.getAddress());
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(Integer customerId, CustomerRequestDTO dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        User user = customer.getUser();
        
        // Cập nhật User
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        // Chỉ cập nhật email nếu nó đã thay đổi VÀ chưa tồn tại
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
             throw new IllegalArgumentException("Email already in use");
        }
        user.setEmail(dto.getEmail());
        userRepository.save(user);

        // Cập nhật Customer
        customer.setAddress(dto.getAddress());
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        // Do schema có ON DELETE CASCADE, chỉ cần xóa user (hoặc customer)
        // Xóa user sẽ tự động xóa customer (do FK)
        // Xóa customer sẽ tự động xóa vehicles (do FK)
        customerRepository.delete(customer); 
        // Hoặc userRepository.delete(customer.getUser());
    }

    // === QUẢN LÝ XE ===

    @Transactional
    public Vehicle createVehicle(Integer customerId, VehicleRequestDTO dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        Vehicle vehicle = new Vehicle();
        // Map DTO to Entity (ví dụ)
        vehicle.setCustomer(customer);
        vehicle.setVin(dto.getVin());
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setOdometerKm(dto.getOdometerKm());
        vehicle.setBatteryCapacityKwh(dto.getBatteryCapacityKwh());
        vehicle.setLastServiceDate(dto.getLastServiceDate());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Integer vehicleId, VehicleRequestDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // Map DTO to Entity
        vehicle.setVin(dto.getVin());
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setOdometerKm(dto.getOdometerKm());
        vehicle.setBatteryCapacityKwh(dto.getBatteryCapacityKwh());
        vehicle.setLastServiceDate(dto.getLastServiceDate());
        
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Integer vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle not found");
        }
        vehicleRepository.deleteById(vehicleId);
    }
}
