 # Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
COPY src ./src

# Compilar y empaquetar
RUN chmod +x ./gradlew && \
    ./gradlew clean build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar JAR desde builder
COPY --from=builder /app/build/libs/*.jar app.jar

# Crear usuario no-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Puerto
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/api/cuentas || exit 1

# Ejecutar aplicación
ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]
