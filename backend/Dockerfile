# ---- build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src src
RUN ./mvnw -B -q package -DskipTests

# ---- run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 farmaid
COPY --from=build /app/target/farmaid-backend-*.jar app.jar
USER farmaid
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
# Health endpoint for the hosting platform: GET /actuator/health
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
