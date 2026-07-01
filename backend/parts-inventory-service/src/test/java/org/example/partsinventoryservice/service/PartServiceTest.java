package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.exception.BadRequestException;
import org.example.partsinventoryservice.exception.ResourceNotFoundException;
import org.example.partsinventoryservice.repository.PartInventoryRepository;
import org.example.partsinventoryservice.repository.PartRepository;
import org.example.partsinventoryservice.repository.PartTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit test cho PartService - white box coverage")
class PartServiceTest {

    @Mock
    private PartRepository partRepository;

    @Mock
    private PartInventoryRepository inventoryRepository;

    @Mock
    private PartTransactionRepository transactionRepository;

    private PartService partService;

    @BeforeEach
    void setUp() {
        partService = new PartService(partRepository, inventoryRepository, transactionRepository);
    }

    @Test
    @DisplayName("Get all parts phải gọi repository và trả về danh sách")
    void getAllPartsShouldReturnPartsFromRepository() {
        Part part = validPart();
        when(partRepository.findAllWithInventory()).thenReturn(Collections.singletonList(part));

        var result = partService.getAllParts();

        assertNotNull(result);
        assertSame(part, result.get(0));
        verify(partRepository).findAllWithInventory();
    }

    @Test
    @DisplayName("Get by id khi không tồn tại phải ném ResourceNotFoundException")
    void getByIdShouldThrowWhenNotFound() {
        when(partRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> partService.getById(1L));

        assertEquals("Part not found with id=1", ex.getMessage());
    }

    @Test
    @DisplayName("Get by code khi không tồn tại phải ném ResourceNotFoundException")
    void getByCodeShouldThrowWhenNotFound() {
        when(partRepository.findByPartCode("P1001")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> partService.getByCode("P1001"));

        assertEquals("Part not found with code=P1001", ex.getMessage());
    }

    @Test
    @DisplayName("Update hợp lệ với cùng partCode của chính bản ghi không lỗi")
    void updateShouldAllowSamePartCodeForSameId() {
        Part existing = validPart();
        existing.setPartId(1L);
        Part updateRequest = validPart();
        updateRequest.setPartCode(existing.getPartCode());
        updateRequest.setPartId(1L);
        updateRequest.setName("Updated Battery Pack");

        when(partRepository.findByPartCode(existing.getPartCode())).thenReturn(Optional.of(existing));
        when(partRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(partRepository.save(existing)).thenReturn(existing);

        Part result = partService.update(1L, updateRequest);

        assertSame(existing, result);
        assertEquals("Updated Battery Pack", result.getName());
        verify(partRepository).save(existing);
    }

    @Test
    @DisplayName("Update với partCode trùng của bản ghi khác phải ném BadRequestException")
    void updateShouldRejectDuplicatePartCodeFromOtherPart() {
        Part existing = validPart();
        existing.setPartId(1L);
        Part otherPart = validPart();
        otherPart.setPartId(2L);
        otherPart.setPartCode("P1002");

        Part updateRequest = validPart();
        updateRequest.setPartId(1L);
        updateRequest.setPartCode(otherPart.getPartCode());

        when(partRepository.findByPartCode(updateRequest.getPartCode())).thenReturn(Optional.of(otherPart));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.update(1L, updateRequest));

        assertEquals("partCode already exists", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Update với dữ liệu thiếu name phải ném BadRequestException")
    void updateShouldRejectMissingName() {
        Part existing = validPart();
        existing.setPartId(1L);
        Part updateRequest = validPart();
        updateRequest.setPartId(1L);
        updateRequest.setName(null);

        when(partRepository.findByPartCode(updateRequest.getPartCode())).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.update(1L, updateRequest));

        assertEquals("name is required", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Update với id không tồn tại phải ném ResourceNotFoundException")
    void updateShouldThrowWhenPartNotFound() {
        Part updateRequest = validPart();
        updateRequest.setPartId(1L);

        when(partRepository.findByPartCode(updateRequest.getPartCode())).thenReturn(Optional.empty());
        when(partRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> partService.update(1L, updateRequest));

        assertEquals("Part not found with id=1", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Delete tồn tại phải xóa transaction, inventory và part")
    void deleteShouldDeletePartsAndRelatedData() {
        Part existing = validPart();
        existing.setPartId(3L);

        when(partRepository.findById(3L)).thenReturn(Optional.of(existing));

        partService.delete(3L);

        verify(transactionRepository).deleteAllByPart_PartId(3L);
        verify(inventoryRepository).deleteByPart_PartId(3L);
        verify(partRepository).delete(existing);
    }

    @Test
    @DisplayName("Delete không tồn tại phải ném ResourceNotFoundException")
    void deleteShouldThrowWhenPartNotFound() {
        when(partRepository.findById(3L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> partService.delete(3L));

        assertEquals("Part not found with id=3", ex.getMessage());
        verify(transactionRepository, never()).deleteAllByPart_PartId(anyLong());
        verify(inventoryRepository, never()).deleteByPart_PartId(anyLong());
        verify(partRepository, never()).delete(any(Part.class));
    }

    private Part validPart() {
        Part part = new Part();
        part.setPartCode("P1001");
        part.setName("Battery Pack");
        part.setUnitPrice(BigDecimal.valueOf(2500000));
        return part;
    }
}
