package org.example.partsinventoryservice.service;

import org.example.partsinventoryservice.entity.Part;
import org.example.partsinventoryservice.exception.BadRequestException;
import org.example.partsinventoryservice.repository.PartInventoryRepository;
import org.example.partsinventoryservice.repository.PartRepository;
import org.example.partsinventoryservice.repository.PartTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
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
    void createShouldRejectMissingPartCode() {
        Part part = validPart();
        part.setPartCode(null);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("partCode is required", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    @Test
    void createShouldRejectBlankPartCode() {
        Part part = validPart();
        part.setPartCode("   ");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> partService.create(part));

        assertEquals("partCode is required", ex.getMessage());
        verify(partRepository, never()).save(any(Part.class));
    }

    private Part validPart() {
        Part part = new Part();
        part.setPartCode("P1001");
        part.setName("Battery Pack");
        part.setUnitPrice(BigDecimal.valueOf(2500000));
        return part;
    }
}
