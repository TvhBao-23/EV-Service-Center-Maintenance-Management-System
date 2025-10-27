package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.dto.request.*;
import org.example.partsinventoryservice.dto.response.RequestResponseDto;
import org.example.partsinventoryservice.entity.*;
import org.example.partsinventoryservice.entity.enum_.RequestStatus;
import org.example.partsinventoryservice.entity.enum_.TransactionType;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.respository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RequestService {

    private final PartRequestRepository requestRepository;
    private final PartRepository partRepository;
    private final PartInventoryRepository inventoryRepository;
    private final PartTransactionRepository transactionRepository;
    private final InventoryService inventoryService;

    public RequestService(PartRequestRepository requestRepository,
                          PartRepository partRepository,
                          PartInventoryRepository inventoryRepository,
                          PartTransactionRepository transactionRepository,
                          InventoryService inventoryService) {
        this.requestRepository = requestRepository;
        this.partRepository = partRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.inventoryService = inventoryService;
    }

    // Technician gửi yêu cầu xuất kho
    @Transactional
    public RequestResponseDto createRequest(CreateRequestDto dto) {
        PartRequest request = new PartRequest();
        request.setRequestedBy(dto.getRequestedBy());
        request.setReason(dto.getReason());
        request.setStatus(RequestStatus.PENDING);

        List<PartRequestItem> items = dto.getItems().stream().map(itemDto -> {
            Part part = partRepository.findById(itemDto.getPartId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng ID: " + itemDto.getPartId()));
            PartRequestItem item = new PartRequestItem();
            item.setPartRequest(request);
            item.setPart(part);
            item.setQuantityRequested(itemDto.getQuantity());
            return item;
        }).toList();

        request.setItems(items);
        requestRepository.save(request);
        return RequestResponseDto.fromEntity(request);
    }

    // Admin duyệt yêu cầu
    @Transactional
    public RequestResponseDto approveRequest(Long requestId, List<ApproveItemDto> approveItems, String approvedBy) {
        PartRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu."));
        request.setStatus(RequestStatus.APPROVED);

        for (ApproveItemDto dto : approveItems) {
            inventoryService.updateStock(dto.getPartId(), -dto.getQuantityApproved());
            Part part = partRepository.findById(dto.getPartId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng."));
            PartTransaction transaction = new PartTransaction();
            transaction.setPart(part);
            transaction.setQuantity(dto.getQuantityApproved());
            transaction.setType(TransactionType.EXPORT);
            transaction.setPerformedBy(approvedBy);
            transactionRepository.save(transaction);
        }

        return RequestResponseDto.fromEntity(requestRepository.save(request));
    }

    // Admin từ chối
    @Transactional
    public RequestResponseDto rejectRequest(Long requestId, RejectDto dto) {
        PartRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu."));
        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(dto.getReason());
        return RequestResponseDto.fromEntity(requestRepository.save(request));
    }

    public List<RequestResponseDto> getAllRequests() {
        return requestRepository.findAll()
                .stream()
                .map(RequestResponseDto::fromEntity)
                .toList();
    }
}
