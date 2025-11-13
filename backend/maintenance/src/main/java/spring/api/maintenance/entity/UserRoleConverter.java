package spring.api.maintenance.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter để convert UserRole enum từ database string
 */
@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<User.UserRole, String> {

    @Override
    public String convertToDatabaseColumn(User.UserRole attribute) {
        if (attribute == null) {
            return null;
        }
        // Map enum to database values (lowercase)
        return attribute.name().toLowerCase();
    }

    @Override
    public User.UserRole convertToEntityAttribute(String dbData) {
        return User.UserRole.fromString(dbData);
    }
}

