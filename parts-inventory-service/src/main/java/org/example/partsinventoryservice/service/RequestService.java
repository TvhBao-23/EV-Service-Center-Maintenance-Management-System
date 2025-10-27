package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.dto.request.ApproveItemDto;
import org.example.partsinventoryservice.dto.request.CreateRequestDto;
import org.example.partsinventoryservice.dto.request.CreateRequestItemDto;
import org.example.partsinventoryservice.dto.request.RejectDto;
import org.example.partsinventoryservice.dto.response.RequestResponseDto;
import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.entity.PartRequest;
import org.example.partsinventoryservice.entity.PartRequestItem;
import org.example.partsinventoryservice.entity.enum_.RequestStatus;
import org.example.partsinventoryservice.exception.BadRequestException;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.repository.PartRepository;
import org.example.partsinventoryservice.repository.PartRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RequestService {

    private final PartRequestRepository requestRepo;
    private final PartRepository partRepo;
    private final InventoryService inventoryService;

    public RequestService(PartRequestRepository requestRepo,
                          PartRepository partRepo,
                          InventoryService inventoryService) {
        this.requestRepo = requestRepo;
        this.partRepo = partRepo;
        this.inventoryService = inventoryService;
    }

    /**
     * Technician tạo yêu cầu xuất kho
     */
    @Transactional
    public RequestResponseDto createRequest(CreateRequestDto dto) {
        if (dto.getCreatedByStaffId() == null) {
            throw new BadRequestException("Thiếu createdByStaffId");
        }
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("Danh sách phụ tùng trống");
        }

        PartRequest req = new PartRequest();
        req.setOrderId(dto.getOrderId()); // có thể null
        req.setCreatedByStaffId(dto.getCreatedByStaffId());
        req.setStatus(RequestStatus.PENDING);
        req.setReason(dto.getReason());
        req.setCreatedAt(LocalDateTime.now());

        List<PartRequestItem> items = new ArrayList<>();
        for (CreateRequestItemDto it : dto.getItems()) {
            Part part = partRepo.findById(it.getPartId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng id=" + it.getPartId()));
            PartRequestItem item = new PartRequestItem();
            item.setRequest(req);
            item.setPart(part);
            item.setQuantityRequested(it.getQuantity());
            item.setQuantityApproved(0);
            items.add(item);
        }
        req.setItems(items);
        requestRepo.save(req);
        return RequestResponseDto.fromEntity(req);
    }

    /**
     * Admin duyệt toàn bộ theo "số lượng yêu cầu" (auto approve full)
     */
    @Transactional
    public RequestResponseDto approveAll(Long requestId, Long approvedByStaffId) {
        PartRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu id=" + requestId));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Chỉ duyệt yêu cầu ở trạng thái PENDING");
        }

        req.setApprovedByStaffId(approvedByStaffId);
        req.setApprovedAt(LocalDateTime.now());

        // trừ kho cho từng item theo số lượng requested
        for (PartRequestItem item : req.getItems()) {
            int qty = item.getQuantityRequested();
            inventoryService.exportStock(
                    item.getPart().getPartId(),
                    qty,
                    approvedByStaffId,
                    "Xuất kho theo yêu cầu #" + req.getRequestId(),
                    req.getOrderId(),
                    req.getRequestId()
            );
            item.setQuantityApproved(qty);
        }

        req.setStatus(RequestStatus.APPROVED);
        requestRepo.save(req);
        return RequestResponseDto.fromEntity(req);
    }

    /**
     * Admin duyệt theo danh sách item (có thể duyệt không đủ)
     */
    @Transactional
    public RequestResponseDto approveWithItems(Long requestId, List<ApproveItemDto> items, Long approvedByStaffId) {
        PartRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu id=" + requestId));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Chỉ duyệt yêu cầu ở trạng thái PENDING");
        }
        req.setApprovedByStaffId(approvedByStaffId);
        req.setApprovedAt(LocalDateTime.now());

        // map từng item theo partId
        for (ApproveItemDto a : items) {
            PartRequestItem target = req.getItems().stream()
                    .filter(i -> i.getPart().getPartId().equals(a.getPartId()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("PartId " + a.getPartId() + " không có trong yêu cầu"));

            if (a.getQuantityApproved() < 0 || a.getQuantityApproved() > target.getQuantityRequested()) {
                throw new BadRequestException("Số lượng duyệt không hợp lệ cho partId=" + a.getPartId());
            }

            if (a.getQuantityApproved() > 0) {
                inventoryService.exportStock(
                        a.getPartId(),
                        a.getQuantityApproved(),
                        approvedByStaffId,
                        "Xuất kho theo yêu cầu #" + req.getRequestId(),
                        req.getOrderId(),
                        req.getRequestId()
                );
            }
            target.setQuantityApproved(a.getQuantityApproved());
        }

        req.setStatus(RequestStatus.APPROVED);
        requestRepo.save(req);
        return RequestResponseDto.fromEntity(req);
    }

    /**
     * Admin từ chối
     */
    @Transactional
    public RequestResponseDto reject(Long requestId, RejectDto dto, Long approvedByStaffId) {
        PartRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu id=" + requestId));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Chỉ từ chối yêu cầu ở trạng thái PENDING");
        }

        req.setApprovedByStaffId(approvedByStaffId);
        req.setApprovedAt(LocalDateTime.now());
        req.setStatus(RequestStatus.REJECTED);
        req.setRejectReason(dto.getReason());
        requestRepo.save(req);

        return RequestResponseDto.fromEntity(req);
    }

    @Transactional(readOnly = true)
    public List<RequestResponseDto> getAll() {
        return requestRepo.findAll().stream()
                .map(RequestResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequestResponseDto getById(Long requestId) {
        PartRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu id=" + requestId));
        return RequestResponseDto.fromEntity(req);
    }
}
