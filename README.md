# Sistema Financiero Ludi

Sistema web para gestionar clientes, negocios, créditos, desembolsos, pagos y cobranzas de la financiera Ludi.

## Tecnologías utilizadas

- **Backend:** Java 17 y Spring Boot.
- **Frontend:** React y Vite.
- **Base de datos:** MySQL 8.
- **Contenedores:** Docker y Docker Compose.
- **Comunicación y seguridad:** Axios y JWT.

## Requisitos previos

Para ejecutar el proyecto mediante Docker, necesitas tener instalado:

- Docker.
- Docker Compose.

## Instalación y ejecución con Docker

### 1. Clonar el repositorio

```bash
git clone https://github.com/jzapata7660/sistema-financiero-ludi.git
cd sistema-financiero-ludi
```

### 2. Crear el archivo de configuración

**Linux / macOS:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

### 3. Iniciar la aplicación

```bash
docker compose up --build
```

Para ejecutar los servicios en segundo plano:

```bash
docker compose up --build -d
```

## Servicios disponibles

Una vez iniciados los contenedores, podrás acceder a los siguientes servicios:

| Servicio | Dirección |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |
| MySQL | localhost:3307 |

> **Nota:** Los puertos pueden modificarse desde el archivo `.env`.

## Configuración del entorno

El archivo `.env.example` contiene las principales variables de configuración:

```env
DB_ROOT_PASSWORD=
DB_NAME=bd_ludi_financiera
DB_USER=root
DB_HOST_PORT=3307

PHPMYADMIN_PORT=8081
BACKEND_PORT=8080
FRONTEND_PORT=5173

VITE_API_URL=http://localhost:8080/api
```

Para personalizar la configuración, modifica los valores correspondientes en el archivo `.env`.

## Base de datos

La base de datos se inicializa automáticamente al iniciar los contenedores de Docker, utilizando el siguiente archivo SQL:

```text
schema_y_datos.sql
```

### Reinicializar la base de datos

Si necesitas eliminar los datos existentes y crear nuevamente la base de datos, ejecuta:

```bash
docker compose down -v
docker compose up --build
```

## Usuarios de prueba

El proyecto incluye usuarios de prueba definidos en el archivo `schema_y_datos.sql`.

| Campo | Credencial |
|---|---|
| Usuario | ana.analista@ludi.com |
| Contraseña | 123456 |

> Estas credenciales son únicamente para pruebas y desarrollo.

## Ejecución manual (sin Docker)

También es posible ejecutar el backend y el frontend de manera independiente.

### Backend

**Linux / macOS:**

```bash
cd backend
./mvnw spring-boot:run
```

**Windows PowerShell:**

```powershell
cd backend
mvnw.cmd spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Ejecución de pruebas

### Backend

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Detener la aplicación

Para detener los contenedores sin eliminar los datos almacenados:

```bash
docker compose down
```
