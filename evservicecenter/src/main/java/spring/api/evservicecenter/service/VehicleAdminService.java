package spring.api.evservicecenter.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import spring.api.evservicecenter.dto.VehicleRequestDto;
import spring.api.evservicecenter.model.Customer;
import spring.api.evservicecenter.model.Vehicle;
import spring.api.evservicecenter.repository.CustomerRepository;
import spring.api.evservicecenter.repository.VehicleRepository;

@Service
public class VehicleAdminService {

    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private CustomerRepository customerRepository; // Để tìm khách hàng

    // THÊM (CREATE)
    public Vehicle createVehicle(VehicleRequestDto requestDto) {
        // Tìm khách hàng
        Customer customer = customerRepository.findById(requestDto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);
        vehicle.setVin(requestDto.getVin());
        vehicle.setBrand(requestDto.getBrand());
        vehicle.setModel(requestDto.getModel());
        vehicle.setYear(requestDto.getYear());
        vehicle.setBatteryCapacityKwh(requestDto.getBatteryCapacityKwh());
        // set các trường khác...
        
        return vehicleRepository.save(vehicle);
    }

    // SỬA (UPDATE)
    public Vehicle updateVehicle(Long vehicleId, VehicleRequestDto requestDto) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        // (Tùy chọn) Cập nhật chủ sở hữu nếu customerId được cung cấp và khác
        if (requestDto.getCustomerId() != null && !vehicle.getCustomer().getCustomerId().equals(requestDto.getCustomerId())) {
             Customer customer = customerRepository.findById(requestDto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
             vehicle.setCustomer(customer);
        }
        
        vehicle.setVin(requestDto.getVin());
        vehicle.setBrand(requestDto.getBrand());
        vehicle.setModel(requestDto.getModel());
        // ...
        
        return vehicleRepository.save(vehicle);
    }
    
    // XÓA (DELETE)
    public void deleteVehicle(Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
             throw new RuntimeException("Không tìm thấy xe");
        }
        // Nhờ CascadeType.ALL ở Entity, các ServiceOrder liên quan sẽ bị xóa
        vehicleRepository.deleteById(vehicleId);
    }
}