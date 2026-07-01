package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.exception.BadRequestException;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit test validate tạo phụ tùng trong PartService")
class PartServiceCreateValidationTest {

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
    @DisplayName("TC Part 05 - Thiếu partCode thì ném BadRequestException")
    void createShouldRejectMissingPartCode() {
        Part part = validPart();
        part.setPartCode(null);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("partCode is required", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("TC Part 05 - partCode rỗng thì ném BadRequestException")
    void createShouldRejectBlankPartCode() {
        Part part = validPart();
        part.setPartCode("   ");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("partCode is required", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Tên phụ tùng bị thiếu thì ném BadRequestException")
    void createShouldRejectMissingName() {
        Part part = validPart();
        part.setName(null);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("name is required", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Tên phụ tùng rỗng thì ném BadRequestException")
    void createShouldRejectBlankName() {
        Part part = validPart();
        part.setName(" ");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("name is required", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Giá phụ tùng bị thiếu thì ném BadRequestException")
    void createShouldRejectMissingUnitPrice() {
        Part part = validPart();
        part.setUnitPrice(null);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("unitPrice must be greater than or equal to 0", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Giá phụ tùng âm thì ném BadRequestException")
    void createShouldRejectNegativeUnitPrice() {
        Part part = validPart();
        part.setUnitPrice(BigDecimal.valueOf(-1));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("unitPrice must be greater than or equal to 0", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    @DisplayName("Dữ liệu hợp lệ thì lưu phụ tùng thành công")
    void createShouldSaveValidPart() {
        Part part = validPart();
        when(partRepository.save(part)).thenReturn(part);

        Part result = partService.create(part);

        assertSame(part, result);
        verify(partRepository).save(part);
    }

    private Part validPart() {
        Part part = new Part();
        part.setPartCode("P1001");
        part.setName("Battery Pack");
        part.setUnitPrice(BigDecimal.valueOf(2500000));
        return part;
    }
}
