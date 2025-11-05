# Use Eclipse Temurin 21 JRE for smaller image
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Copy the built war file
COPY target/evservicecenter-0.0.1-SNAPSHOT.war app.war

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.war"]
