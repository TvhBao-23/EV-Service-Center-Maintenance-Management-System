package spring.api.maintenance.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter để convert AppointmentStatus enum từ database string
 */
@Converter(autoApply = true)
public class AppointmentStatusConverter implements AttributeConverter<Appointment.AppointmentStatus, String> {

    @Override
    public String convertToDatabaseColumn(Appointment.AppointmentStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public Appointment.AppointmentStatus convertToEntityAttribute(String dbData) {
        return Appointment.AppointmentStatus.fromString(dbData);
    }
}
