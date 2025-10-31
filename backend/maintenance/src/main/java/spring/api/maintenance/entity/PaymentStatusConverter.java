package spring.api.maintenance.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter để convert PaymentStatus enum từ database string
 */
@Converter(autoApply = true)
public class PaymentStatusConverter implements AttributeConverter<ServiceOrder.PaymentStatus, String> {

    @Override
    public String convertToDatabaseColumn(ServiceOrder.PaymentStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public ServiceOrder.PaymentStatus convertToEntityAttribute(String dbData) {
        return ServiceOrder.PaymentStatus.fromString(dbData);
    }
}
