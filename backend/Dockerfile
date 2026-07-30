# Etapa 1: Compilar la aplicación con Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Descargar dependencias para aprovechar la caché de Docker
RUN mvn dependency:go-offline

# Copiar el código fuente y construir
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Imagen ligera para ejecución (sólo JRE)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/financiera-0.0.1-SNAPSHOT.jar app.jar

# El puerto que expone Spring Boot
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
