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
        // Map enum to database values
        switch (attribute) {
            case UNPAID:
                return "unpaid";
            case PAID:
                return "paid";
            case PARTIALLY_PAID:
                return "partially_paid";
            default:
                return "unpaid";
        }
    }

    @Override
    public ServiceOrder.PaymentStatus convertToEntityAttribute(String dbData) {
        return ServiceOrder.PaymentStatus.fromString(dbData);
    }
}
