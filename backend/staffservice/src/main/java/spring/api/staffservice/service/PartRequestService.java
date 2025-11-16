package spring.api.staffservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.api.staffservice.domain.Part;
import spring.api.staffservice.domain.PartRequest;
import spring.api.staffservice.repository.PartRequestRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartRequestService {
    private final PartRequestRepository partRequestRepository;
    private final PartService partService;

    public List<PartRequest> getAllRequests() {
        return partRequestRepository.findAll();
    }

    public PartRequest getRequestById(Long requestId) {
        return partRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Part request not found with ID: " + requestId));
    }

    public List<PartRequest> getRequestsByCustomerId(Long customerId) {
        return partRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<PartRequest> getPendingRequests() {
        return partRequestRepository.findByStatus(PartRequest.RequestStatus.pending);
    }

    @Transactional
    public PartRequest createRequest(PartRequest request) {
        // Validate part exists
        partService.getPartById(request.getPartId());
        
        log.info("Creating new part request for customer {}", request.getCustomerId());
        return partRequestRepository.save(request);
    }

    @Transactional
    public PartRequest approveRequest(Long requestId, Long staffId, BigDecimal approvedPrice) {
        PartRequest request = getRequestById(requestId);
        
        if (request.getStatus() != PartRequest.RequestStatus.pending) {
            throw new RuntimeException("Only pending requests can be approved");
        }
        
        // Check stock availability
        Part part = partService.getPartById(request.getPartId());
        if (part.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + part.getStockQuantity() 
                    + ", Requested: " + request.getQuantity());
        }
        
        request.setStatus(PartRequest.RequestStatus.approved);
        request.setApprovedBy(staffId);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedPrice(approvedPrice != null ? approvedPrice : part.getUnitPrice());
        
        log.info("Approved part request {} by staff {}", requestId, staffId);
        return partRequestRepository.save(request);
    }

    @Transactional
    public PartRequest rejectRequest(Long requestId, Long staffId, String reason) {
        PartRequest request = getRequestById(requestId);
        
        if (request.getStatus() != PartRequest.RequestStatus.pending) {
            throw new RuntimeException("Only pending requests can be rejected");
        }
        
        request.setStatus(PartRequest.RequestStatus.rejected);
        request.setApprovedBy(staffId);
        request.setApprovedAt(LocalDateTime.now());
        request.setStaffNotes(reason);
        
        log.info("Rejected part request {} by staff {}", requestId, staffId);
        return partRequestRepository.save(request);
    }

    @Transactional
    public PartRequest fulfillRequest(Long requestId, Long staffId) {
        PartRequest request = getRequestById(requestId);
        
        if (request.getStatus() != PartRequest.RequestStatus.approved) {
            throw new RuntimeException("Only approved requests can be fulfilled");
        }
        
        // Reduce stock
        Part part = partService.getPartById(request.getPartId());
        int newStock = part.getStockQuantity() - request.getQuantity();
        if (newStock < 0) {
            throw new RuntimeException("Insufficient stock for fulfillment");
        }
        
        partService.updateStock(request.getPartId(), newStock);
        
        request.setStatus(PartRequest.RequestStatus.fulfilled);
        
        log.info("Fulfilled part request {} by staff {}", requestId, staffId);
        return partRequestRepository.save(request);
    }

    @Transactional
    public PartRequest updateRequest(Long requestId, PartRequest updatedRequest) {
        PartRequest request = getRequestById(requestId);
        
        if (request.getStatus() != PartRequest.RequestStatus.pending) {
            throw new RuntimeException("Only pending requests can be updated");
        }
        
        request.setQuantity(updatedRequest.getQuantity());
        request.setRequestType(updatedRequest.getRequestType());
        request.setNotes(updatedRequest.getNotes());
        request.setDeliveryMethod(updatedRequest.getDeliveryMethod());
        request.setDeliveryAddress(updatedRequest.getDeliveryAddress());
        
        log.info("Updated part request {}", requestId);
        return partRequestRepository.save(request);
    }

    @Transactional
    public void deleteRequest(Long requestId) {
        PartRequest request = getRequestById(requestId);
        log.info("Deleting part request ID: {}", requestId);
        partRequestRepository.delete(request);
    }
}

