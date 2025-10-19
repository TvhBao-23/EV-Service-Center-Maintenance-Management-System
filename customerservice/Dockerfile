FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy pom.xml first for better caching
COPY pom.xml .

# Download dependencies with retry
RUN mvn dependency:go-offline -Dmaven.wagon.http.retryHandler.count=3 || \
    (sleep 10 && mvn dependency:go-offline -Dmaven.wagon.http.retryHandler.count=3) || \
    (sleep 30 && mvn dependency:go-offline -Dmaven.wagon.http.retryHandler.count=3)

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
ENV JAVA_OPTS=""
COPY --from=build /app/target/customerservice-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]


