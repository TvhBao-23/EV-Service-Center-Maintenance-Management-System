package spring.api.maintenance.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter để convert ItemType enum từ database string
 */
@Converter(autoApply = true)
public class ItemTypeConverter implements AttributeConverter<OrderItem.ItemType, String> {

    @Override
    public String convertToDatabaseColumn(OrderItem.ItemType attribute) {
        if (attribute == null) {
            return null;
        }
        // Map enum to database values (lowercase)
        return attribute.name().toLowerCase();
    }

    @Override
    public OrderItem.ItemType convertToEntityAttribute(String dbData) {
        return OrderItem.ItemType.fromString(dbData);
    }
}

