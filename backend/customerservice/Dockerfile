FROM eclipse-temurin:17-jdk AS build

RUN apt-get update && apt-get install -y maven

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/customerservice-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]

