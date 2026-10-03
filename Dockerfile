# Single-container public demo: Angular site + Spring Boot API + in-memory H2 with sample data.
# Needs no database or environment variables; data resets on every restart.
#   docker build -t farmaid-demo . && docker run -p 8080:8080 farmaid-demo   ->  http://localhost:8080
# For real deployments use backend/Dockerfile + frontend/Dockerfile with MySQL (see docker-compose.yml).

# ---- frontend ----
FROM node:24-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npx ng build --configuration demo

# ---- backend (with the site bundled as static resources) ----
FROM eclipse-temurin:21-jdk AS api
WORKDIR /app
COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY backend/src src
COPY --from=web /web/dist/frontend/browser src/main/resources/static
RUN ./mvnw -B -q package -DskipTests

# ---- runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 farmaid
COPY --from=api /app/target/farmaid-backend-*.jar app.jar
USER farmaid
ENV SPRING_PROFILES_ACTIVE=demo
EXPOSE 8080
# Small heap + serial GC to fit free 512 MB instances. Render/Railway set PORT; the app reads it.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-XX:+UseSerialGC", "-Xss512k", "-jar", "app.jar"]
