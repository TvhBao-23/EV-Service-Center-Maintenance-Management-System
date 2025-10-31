package spring.api.maintenance.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter để convert ServiceType enum từ database string
 */
@Converter(autoApply = true)
public class ServiceTypeConverter implements AttributeConverter<ServiceEntity.ServiceType, String> {

    @Override
    public String convertToDatabaseColumn(ServiceEntity.ServiceType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public ServiceEntity.ServiceType convertToEntityAttribute(String dbData) {
        return ServiceEntity.ServiceType.fromString(dbData);
    }
}
