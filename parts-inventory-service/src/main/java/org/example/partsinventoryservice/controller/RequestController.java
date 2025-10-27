package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.dto.request.*;
import org.example.partsinventoryservice.dto.response.RequestResponseDto;
import org.example.partsinventoryservice.service.RequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    // Gửi yêu cầu xuất kho (Technician)
    @PostMapping
    public ResponseEntity<RequestResponseDto> createRequest(@RequestBody CreateRequestDto dto) {
        return ResponseEntity.ok(requestService.createRequest(dto));
    }

    // Admin duyệt yêu cầu
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<RequestResponseDto> approveRequest(@PathVariable Long requestId,
                                                             @RequestBody List<ApproveItemDto> approveItems,
                                                             @RequestParam String approvedBy) {
        return ResponseEntity.ok(requestService.approveRequest(requestId, approveItems, approvedBy));
    }

    // Admin từ chối
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<RequestResponseDto> rejectRequest(@PathVariable Long requestId,
                                                            @RequestBody RejectDto dto) {
        return ResponseEntity.ok(requestService.rejectRequest(requestId, dto));
    }

    // Lấy danh sách yêu cầu
    @GetMapping
    public ResponseEntity<List<RequestResponseDto>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }
}
