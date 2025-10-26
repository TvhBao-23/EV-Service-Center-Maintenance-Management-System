package spring.api.evservicecenter.adminworkshop.service;


import spring.api.evservicecenter.adminworkshop.dto.StaffRequestDTO;
import spring.api.evservicecenter.adminworkshop.dto.StaffResponseDTO;
import spring.api.evservicecenter.adminworkshop.entity.Staff;
import spring.api.evservicecenter.adminworkshop.entity.User;
import spring.api.evservicecenter.adminworkshop.enums.StaffPosition;
import spring.api.evservicecenter.adminworkshop.enums.UserRole;
import spring.api.evservicecenter.adminworkshop.exception.ResourceNotFoundException;
import spring.api.evservicecenter.adminworkshop.repository.StaffRepository;
import spring.api.evservicecenter.adminworkshop.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils; // For checking password

import java.util.List;

@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<StaffResponseDTO> getAllStaff() {
        return staffRepository.findAllStaffSummaries();
    }

    public StaffResponseDTO getStaffById(Integer staffId) {
        // Fetch DTO directly if possible, or fetch entity and map
        return staffRepository.findAllStaffSummaries().stream()
                .filter(s -> s.getStaffId().equals(staffId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
         // Alternatively fetch Staff entity using findByIdWithUser and map manually
    }


    @Transactional
    public StaffResponseDTO createStaff(StaffRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email '" + dto.getEmail() + "' is already in use.");
        }
        if (!StringUtils.hasText(dto.getPassword())) {
             throw new IllegalArgumentException("Password is required for new staff members.");
        }
        // Validate Role vs Position consistency (optional but recommended)
         if ((dto.getRole() == UserRole.technician && dto.getPosition() != StaffPosition.technician) || (dto.getRole() == UserRole.staff && dto.getPosition() == StaffPosition.technician)) {
            throw new IllegalArgumentException("Role and Position mismatch.");
         }


        // 1. Create User
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole()); // Set role from DTO
        user.setIsActive(true); // Default to active
        User savedUser = userRepository.save(user);

        // 2. Create Staff
        Staff staff = new Staff();
        staff.setUser(savedUser);
        staff.setPosition(dto.getPosition());
        staff.setHireDate(dto.getHireDate());
        Staff savedStaff = staffRepository.save(staff);

        // 3. Return DTO
        return mapToStaffResponseDTO(savedStaff, savedUser);
    }

    @Transactional
    public StaffResponseDTO updateStaff(Integer staffId, StaffRequestDTO dto) {
        Staff staff = staffRepository.findByIdWithUser(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));

        User user = staff.getUser();

        // Check if email is being changed and if the new email already exists
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email '" + dto.getEmail() + "' is already in use.");
        }

        // Update User fields
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole()); // Update role

        // Optionally update password if provided
        if (StringUtils.hasText(dto.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        // Update isActive status if provided in DTO
        if (dto.getIsActive() != null) {
             user.setIsActive(dto.getIsActive());
        }

        User updatedUser = userRepository.save(user);

        // Update Staff fields
        staff.setPosition(dto.getPosition());
        staff.setHireDate(dto.getHireDate());
        Staff updatedStaff = staffRepository.save(staff);

        return mapToStaffResponseDTO(updatedStaff, updatedUser);
    }

    @Transactional
    public void deleteStaff(Integer staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));

        // Because of CascadeType.ALL on User->Staff relationship and FK constraint ON DELETE CASCADE,
        // deleting the User will automatically delete the Staff record.
        userRepository.delete(staff.getUser());
        // Alternatively: staffRepository.delete(staff); // This also works due to cascade.
    }

    // Helper method to map Entity to DTO
    private StaffResponseDTO mapToStaffResponseDTO(Staff staff, User user) {
        return new StaffResponseDTO(
                staff.getStaffId(),
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                staff.getPosition(),
                staff.getHireDate(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }
}