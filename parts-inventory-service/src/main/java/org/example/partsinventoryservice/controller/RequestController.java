package org.example.partsinventoryservice.controller;

import org.example.partsinventoryservice.dto.request.ApproveItemDto;
import org.example.partsinventoryservice.dto.request.CreateRequestDto;
import org.example.partsinventoryservice.dto.request.RejectDto;
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

    @GetMapping
    public ResponseEntity<List<RequestResponseDto>> getAll() {
        return ResponseEntity.ok(requestService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RequestResponseDto> create(@RequestBody CreateRequestDto dto) {
        return ResponseEntity.ok(requestService.createRequest(dto));
    }

    // Duyệt toàn bộ phiếu (approve all)
    @PutMapping("/{id}/approve-all")
    public ResponseEntity<RequestResponseDto> approveAll(
            @PathVariable Long id,
            @RequestParam Long approvedByStaffId) {
        return ResponseEntity.ok(requestService.approveAll(id, approvedByStaffId));
    }

    // Duyệt chi tiết theo từng item
    @PutMapping("/{id}/approve")
    public ResponseEntity<RequestResponseDto> approveWithItems(
            @PathVariable Long id,
            @RequestBody List<ApproveItemDto> items,
            @RequestParam Long approvedByStaffId) {
        return ResponseEntity.ok(requestService.approveWithItems(id, items, approvedByStaffId));
    }

    // Từ chối yêu cầu
    @PutMapping("/{id}/reject")
    public ResponseEntity<RequestResponseDto> reject(
            @PathVariable Long id,
            @RequestBody RejectDto dto,
            @RequestParam Long approvedByStaffId) {
        return ResponseEntity.ok(requestService.reject(id, dto, approvedByStaffId));
    }
}
