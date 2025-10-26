# === Stage 1: Build ===
# Sử dụng base image Maven chứa JDK 17 (hoặc phiên bản Java bạn dùng)
FROM maven:3.9-eclipse-temurin-17-alpine AS build

# Đặt thư mục làm việc
WORKDIR /app

# Copy file pom.xml trước để tận dụng Docker layer caching
COPY pom.xml .

# Tải dependencies (chỉ tải lại nếu pom.xml thay đổi)
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code
COPY src ./src

# Build ứng dụng và tạo file JAR
# Bỏ qua test nếu bạn chạy test riêng biệt: RUN mvn package -DskipTests -B
# Build ứng dụng và tạo file JAR - Bỏ qua test
RUN mvn package -DskipTests -B

# === Stage 2: Production ===
# Sử dụng base image JRE nhỏ gọn (phù hợp với phiên bản Java của bạn)
FROM eclipse-temurin:17-jre-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Tạo user và group không phải root để chạy ứng dụng
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy file JAR từ stage build
# Tên file JAR có thể khác, kiểm tra trong thư mục 'target' sau khi build
COPY --from=build /app/target/admin-workshop-service-0.0.1-SNAPSHOT.jar app.jar

# Expose cổng mà ứng dụng chạy (khai báo, không thực sự mở cổng)
EXPOSE 8080

# Lệnh để chạy ứng dụng khi container khởi động
# Sử dụng exec form để tín hiệu được chuyển tiếp đúng cách
ENTRYPOINT ["java", "-jar", "app.jar"]