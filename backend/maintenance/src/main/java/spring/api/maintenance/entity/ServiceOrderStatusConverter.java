package spring.api.maintenance.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter để convert ServiceOrderStatus enum từ database string
 */
@Converter(autoApply = true)
public class ServiceOrderStatusConverter implements AttributeConverter<ServiceOrder.ServiceOrderStatus, String> {

    @Override
    public String convertToDatabaseColumn(ServiceOrder.ServiceOrderStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public ServiceOrder.ServiceOrderStatus convertToEntityAttribute(String dbData) {
        return ServiceOrder.ServiceOrderStatus.fromString(dbData);
    }
}
