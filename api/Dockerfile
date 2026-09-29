FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /service/api

COPY api/.mvn .mvn
COPY api/mvnw api/pom.xml ./
RUN ./mvnw dependency:go-offline

COPY api/src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre-jammy AS runtime

RUN useradd --system --create-home spring
WORKDIR /service

COPY --from=build --chown=spring:spring /service/api/target/training-api-0.0.1-SNAPSHOT.jar application.jar

USER spring
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "application.jar"]
