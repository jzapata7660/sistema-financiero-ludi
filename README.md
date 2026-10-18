# Sistema Financiero Ludi

Sistema de gestión financiera desarrollado con **Spring Boot**, **React**, **MySQL** y **Docker**.

Permite gestionar clientes, negocios, solicitudes de crédito, autorizaciones, desembolsos, pagos, cobranza y usuarios según su rol.

## Tecnologías

- Java 17
- Spring Boot
- React + Vite
- MySQL 8
- Docker y Docker Compose

## Requisitos

Para ejecutar localmente:

- Java 17
- Node.js y npm
- MySQL 8
- Maven

Para ejecutar con Docker:

- Docker
- Docker Compose

## Ejecución local

### 1. Base de datos

Crear la base de datos ejecutando:

```bash
mysql -u root -p < schema_y_datos.sql
```

La base de datos se llama:

```text
bd_ludi_financiera
```

### 2. Backend

Configurar la conexión en:

```text
backend/src/main/resources/application.properties
```

Ejecutar:

```bash
cd backend
./mvnw spring-boot:run
```

En Windows:

```powershell
cd backend
mvnw.cmd spring-boot:run
```

Backend disponible en:

```text
http://localhost:8080
```

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en:

```text
http://localhost:5173
```

## Ejecutar pruebas

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Ejecución para producción

### Backend

Compilar:

```bash
cd backend
./mvnw clean package
```

Ejecutar:

```bash
java -jar target/financiera-0.0.1-SNAPSHOT.jar
```

### Frontend

Compilar:

```bash
cd frontend
npm run build
```

Los archivos generados estarán en:

```text
frontend/dist
```

Estos archivos pueden servirse mediante Nginx u otro servidor web.

## Ejecución con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Para ejecutarlo en segundo plano:

```bash
docker compose up --build -d
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |
| MySQL | localhost:3307 |

Para detener los servicios:

```bash
docker compose down
```

Para eliminar también los datos de la base de datos:

```bash
docker compose down -v
```

## Usuarios de prueba

Todos los usuarios incluidos en `schema_y_datos.sql` utilizan la contraseña:

```text
123456
```

Ejemplo:

```text
Usuario: ana.analista@ludi.com
Contraseña: 123456
```

> Las credenciales incluidas son únicamente para pruebas y deben cambiarse en producción.
