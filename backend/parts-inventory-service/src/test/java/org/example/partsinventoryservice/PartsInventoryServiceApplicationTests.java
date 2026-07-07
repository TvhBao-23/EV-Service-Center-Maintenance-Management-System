package org.example.partsinventoryservice;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class PartsInventoryServiceApplicationTests {

    @Test
    void applicationClassCanBeConstructed() {
        assertDoesNotThrow(PartsInventoryServiceApplication::new);
    }
}
