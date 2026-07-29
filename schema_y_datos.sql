-- Crear base de datos
DROP DATABASE IF EXISTS bd_ludi_financiera;
CREATE DATABASE bd_ludi_financiera;
USE bd_ludi_financiera;
SET NAMES 'utf8mb4';

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Agencias (Sucursales)
CREATE TABLE IF NOT EXISTS agencia (
    id_agencia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL
);

-- Tabla de Usuarios (Herencia Single Table simulada o mapeada)
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    agencia_id INT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    meta_mensual DECIMAL(10,2) NULL, -- Para Analista
    limite_aprobacion DECIMAL(10,2) NULL, -- Para Administrador
    caja_asignada VARCHAR(20) NULL, -- Para Cajera
    FOREIGN KEY (rol_id) REFERENCES rol(id_rol),
    FOREIGN KEY (agencia_id) REFERENCES agencia(id_agencia)
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    estado VARCHAR(20) DEFAULT 'Activo'
);

-- Tabla de Historial Crediticio (1 a 1 con Cliente)
CREATE TABLE IF NOT EXISTS historial_crediticio (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL UNIQUE,
    creditos_anteriores INT DEFAULT 0,
    pagos_puntuales INT DEFAULT 0,
    mora_actual_dias INT DEFAULT 0,
    score_crediticio INT NULL,
    ultima_operacion DATE NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente)
);

-- Tabla de Negocios
CREATE TABLE IF NOT EXISTS negocio (
    id_negocio INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    ruc VARCHAR(11) NULL,
    razon_social VARCHAR(150),
    giro_negocio VARCHAR(100),
    direccion VARCHAR(200),
    ingreso_promedio_mensual DECIMAL(10,2),
    tiempo_operacion VARCHAR(50),
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente)
);

-- Tabla de Solicitud de Crédito
CREATE TABLE IF NOT EXISTS solicitud_credito (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    codigo_solicitud VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    negocio_id INT NOT NULL,
    analista_id INT NOT NULL,
    aprobador_id INT NULL,
    monto_solicitado DECIMAL(10,2) NOT NULL,
    plazo_meses INT NOT NULL,
    tasa_interes DECIMAL(5,2) NOT NULL,
    modalidad_pago VARCHAR(20) NOT NULL, -- DIARIO, SEMANAL, MENSUAL
    estado VARCHAR(30) NOT NULL, -- PENDIENTE, APROBADA, RECHAZADA, DESEMBOLSADO
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion DATETIME NULL,
    observaciones VARCHAR(500) NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente),
    FOREIGN KEY (negocio_id) REFERENCES negocio(id_negocio),
    FOREIGN KEY (analista_id) REFERENCES usuario(id_usuario),
    FOREIGN KEY (aprobador_id) REFERENCES usuario(id_usuario)
);

-- Tabla de Parámetros de Evaluación (1 a 1 con Solicitud)
CREATE TABLE IF NOT EXISTS parametros_evaluacion (
    id_parametros INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL UNIQUE,
    cumple_requisitos BOOLEAN DEFAULT FALSE,
    capacidad_pago BOOLEAN DEFAULT FALSE,
    verificacion_ingresos BOOLEAN DEFAULT FALSE,
    referencia_verificada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (solicitud_id) REFERENCES solicitud_credito(id_solicitud)
);

-- Tabla de Historial de Estados de Solicitud
CREATE TABLE IF NOT EXISTS historial_estado_solicitud (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_anterior VARCHAR(30) NULL,
    estado_nuevo VARCHAR(30) NOT NULL,
    evento VARCHAR(50) NOT NULL,
    observacion VARCHAR(500) NULL,
    FOREIGN KEY (solicitud_id) REFERENCES solicitud_credito(id_solicitud)
);

-- Tabla de Cronograma de Pagos
CREATE TABLE IF NOT EXISTS cronograma_pagos (
    id_cronograma INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL UNIQUE,
    total_capital DECIMAL(10,2) NOT NULL,
    total_interes DECIMAL(10,2) NOT NULL,
    total_pagar DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (solicitud_id) REFERENCES solicitud_credito(id_solicitud)
);

-- Tabla de Cuotas
CREATE TABLE IF NOT EXISTS cuota (
    id_cuota INT AUTO_INCREMENT PRIMARY KEY,
    cronograma_id INT NOT NULL,
    numero_cuota INT NOT NULL,
    monto_capital DECIMAL(10,2) NOT NULL,
    monto_interes DECIMAL(10,2) NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADA, VENCIDA
    FOREIGN KEY (cronograma_id) REFERENCES cronograma_pagos(id_cronograma)
);

-- Tabla de Desembolsos
CREATE TABLE IF NOT EXISTS desembolso (
    id_desembolso INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL UNIQUE,
    cajera_id INT NOT NULL,
    monto_desembolsado DECIMAL(10,2) NOT NULL,
    modalidad_desembolso VARCHAR(50) DEFAULT 'Efectivo en Caja',
    banco_destino VARCHAR(100),
    cuenta_destino VARCHAR(50),
    cci_destino VARCHAR(50),
    fecha_desembolso DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitud_credito(id_solicitud),
    FOREIGN KEY (cajera_id) REFERENCES usuario(id_usuario)
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    cuota_id INT NOT NULL,
    analista_id INT NOT NULL,
    numero_cuota INT NOT NULL DEFAULT 1,
    monto_pagado DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    mora_pagada DECIMAL(10,2) DEFAULT 0.00,
    forma_pago VARCHAR(50) DEFAULT 'EFECTIVO',
    observaciones VARCHAR(255) NULL,
    saldo_pendiente DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (cuota_id) REFERENCES cuota(id_cuota),
    FOREIGN KEY (analista_id) REFERENCES usuario(id_usuario)
);

-- Tabla de Expediente Físico
CREATE TABLE IF NOT EXISTS expediente_fisico (
    id_expediente INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL UNIQUE,
    asistente_id INT NULL,
    codigo_carpeta VARCHAR(50) NOT NULL UNIQUE,
    estante VARCHAR(20) NULL,
    fila VARCHAR(20) NULL,
    caja_archivera VARCHAR(20) NULL,
    estado VARCHAR(30) DEFAULT 'POR_ARCHIVAR', -- POR_ARCHIVAR, ARCHIVADO, PRESTADO
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitud_credito(id_solicitud),
    FOREIGN KEY (asistente_id) REFERENCES usuario(id_usuario)
);

-- Tabla de Acciones de Cobranza
CREATE TABLE IF NOT EXISTS accion_cobranza (
    id_accion INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    solicitud_id INT NOT NULL,
    analista_id INT NOT NULL,
    tipo_accion VARCHAR(50) NOT NULL, -- LLAMADA, VISITA, NOTIFICACION
    resultado VARCHAR(255) NOT NULL,
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    compromiso_pago DATE NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente),
    FOREIGN KEY (solicitud_id) REFERENCES solicitud_credito(id_solicitud),
    FOREIGN KEY (analista_id) REFERENCES usuario(id_usuario)
);

-- Tabla Empresa (Datos institucionales)
CREATE TABLE IF NOT EXISTS empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    ruc VARCHAR(11) NOT NULL,
    nombre_comercial VARCHAR(100),
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email_contacto VARCHAR(100)
);

-- ==========================================
-- INSERTAR DATOS SEMILLA (MOCK DATA)
-- ==========================================

-- Agencias (Sucursales)
INSERT INTO agencia (id_agencia, nombre, ubicacion) VALUES 
(1, 'Agencia Principal - La Union', 'La Union, Piura'),
(2, 'Agencia Anexo 0001 - Sechura', 'Calle Bolivar Nro 90..., Sechura, Piura'),
(3, 'Agencia Anexo 0002 - Catacaos', 'Jr. Piura Nro 903, Catacaos, Piura');

-- Empresa
INSERT INTO empresa (razon_social, ruc, nombre_comercial, direccion, telefono, email_contacto)
VALUES ('SERVICIOS FINANCIEROS LUDI E.I.R.L.', '20609139600', 'INVERSIONES LUDI', 'La Union, Piura', '987654321', 'contacto@ludifinanciera.com');

-- Roles
INSERT INTO rol (id_rol, nombre_rol) VALUES 
(1, 'ANALISTA'),
(2, 'ADMINISTRADOR'),
(3, 'GERENTE'),
(4, 'CAJERA'),
(5, 'ARCHIVO'),
(6, 'RECUPERADOR');

-- Usuarios (6 roles)
INSERT INTO usuario (rol_id, agencia_id, nombres, apellidos, email, clave, meta_mensual) 
VALUES (1, 1, 'Ana', 'Analista', 'ana.analista@ludi.com', '123456', 50000.00);

INSERT INTO usuario (rol_id, agencia_id, nombres, apellidos, email, clave, limite_aprobacion) 
VALUES (2, 1, 'Carlos', 'Creditos', 'carlos.creditos@ludi.com', '123456', 1500.00);

INSERT INTO usuario (rol_id, agencia_id, nombres, apellidos, email, clave, limite_aprobacion) 
VALUES (3, 1, 'Roberto', 'Sanchez', 'roberto.gerente@ludi.com', '123456', 100000.00);

INSERT INTO usuario (rol_id, agencia_id, nombres, apellidos, email, clave, caja_asignada) 
VALUES (4, 1, 'Carla', 'Cajera', 'carla.cajera@ludi.com', '123456', 'CAJA-01');

INSERT INTO usuario (rol_id, agencia_id, nombres, apellidos, email, clave) 
VALUES (5, 1, 'Juan', 'Archivo', 'juan.archivo@ludi.com', '123456');

INSERT INTO usuario (rol_id, agencia_id, nombres, apellidos, email, clave) 
VALUES (6, 1, 'Luis', 'Cobranza', 'luis.recuperador@ludi.com', '123456');

-- Clientes (10 Clientes variados)
INSERT INTO cliente (dni, nombres, apellidos, telefono, direccion, estado) VALUES 
('11111111', 'Ana', 'Torres Silva', '987654321', 'Av. Grau 123, Piura', 'Activo'),
('22222222', 'Pedro', 'Sanchez Roa', '912345678', 'Calle Lima 456, Castilla', 'Mora'),
('33333333', 'Maria', 'Lopez Diaz', '923456789', 'Urb. Miraflores 789, Piura', 'Activo'),
('44444444', 'Jorge', 'Gomez Ruiz', '934567890', 'Av. Sanchez Cerro 102, Piura', 'Activo'),
('55555555', 'Elena', 'Castro Vega', '945678901', 'Calle Cuzco 345, Catacaos', 'Activo'),
('66666666', 'Miguel', 'Rojas Soto', '956789012', 'Av. Progreso 567, Castilla', 'Mora'),
('77777777', 'Lucia', 'Perez Mora', '967890123', 'Urb. Santa Ana 890, Piura', 'Activo'),
('88888888', 'Carlos', 'Mendoza Luna', '978901234', 'Av. Loreto 234, Piura', 'Activo'),
('99999999', 'Rosa', 'Vargas Pino', '989012345', 'Calle Tacna 678, Catacaos', 'Mora'),
('00000000', 'Luis', 'Fernandez Gil', '990123456', 'Urb. Bello Horizonte 123, Piura', 'Activo');

-- Negocios (1 para cada cliente)
INSERT INTO negocio (cliente_id, ruc, razon_social, giro_negocio, direccion, ingreso_promedio_mensual, tiempo_operacion) VALUES 
(1, '10111111111', 'Bodega Anita', 'Comercio de Abarrotes', 'Av. Grau 123, Piura', 3500.00, 'Más de 5 años'),
(2, '10222222221', 'Taller Sanchez', 'Otro', 'Calle Lima 456, Castilla', 4200.00, '2 a 5 años'),
(3, '10333333331', 'Boutique Maria', 'Comercio de Ropa', 'Urb. Miraflores 789, Piura', 6000.00, '1 a 2 años'),
(4, '10444444441', 'Ferreteria Gomez', 'Otro', 'Av. Sanchez Cerro 102, Piura', 8500.00, 'Más de 5 años'),
(5, '10555555551', 'Restaurante Elena', 'Gastronomía', 'Calle Cuzco 345, Catacaos', 5200.00, '2 a 5 años'),
(6, '10666666661', 'Libreria Rojas', 'Otro', 'Av. Progreso 567, Castilla', 2800.00, '1 a 2 años'),
(7, '10777777771', 'Farmacia Perez', 'Otro', 'Urb. Santa Ana 890, Piura', 9000.00, 'Más de 5 años'),
(8, '10888888881', 'Transportes Mendoza', 'Transporte', 'Av. Loreto 234, Piura', 7500.00, 'Más de 5 años'),
(9, '10999999991', 'Peluqueria Rosa', 'Otro', 'Calle Tacna 678, Catacaos', 3100.00, 'Menos de 1 año'),
(10, '10000000001', 'Panaderia Fernandez', 'Gastronomía', 'Urb. Bello Horizonte 123, Piura', 4800.00, '2 a 5 años');

-- Historial Crediticio
INSERT INTO historial_crediticio (cliente_id, creditos_anteriores, pagos_puntuales, mora_actual_dias, score_crediticio) VALUES 
(1, 2, 24, 0, 850),
(2, 1, 5, 45, 420),
(3, 4, 48, 0, 920),
(4, 3, 36, 0, 880),
(5, 1, 10, 0, 750),
(6, 2, 12, 13, 550),
(7, 5, 60, 0, 950),
(8, 2, 20, 0, 810),
(9, 0, 0, 40, 250),
(10, 1, 11, 0, 780);

-- Solicitudes de Crédito
INSERT INTO solicitud_credito (id_solicitud, codigo_solicitud, cliente_id, negocio_id, analista_id, aprobador_id, monto_solicitado, plazo_meses, tasa_interes, modalidad_pago, estado, observaciones, fecha_registro, fecha_aprobacion) VALUES 
(1, 'SOL-1700000001', 1, 1, 1, NULL, 500.00, 12, 2.5, 'MENSUAL', 'PENDIENTE', NULL, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), NULL),
(2, 'SOL-1700000002', 2, 2, 1, 2, 1200.00, 12, 3.5, 'MENSUAL', 'RECHAZADA', 'El cliente tiene un nivel de mora de 45 dias. Se rechaza.', DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY)),
(3, 'SOL-1700000003', 3, 3, 1, 3, 4000.00, 24, 1.8, 'MENSUAL', 'APROBADA', 'Excelente perfil crediticio. Aprobado por gerencia.', DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY)),
(4, 'SOL-1700000004', 4, 4, 1, 2, 800.00, 3, 2.0, 'MENSUAL', 'DESEMBOLSADO', 'El negocio tiene buenos ingresos, procede el credito.', DATE_SUB(CURRENT_DATE, INTERVAL 50 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 48 DAY)),
(5, 'SOL-1700000005', 5, 5, 1, 3, 1800.00, 6, 2.5, 'QUINCENAL', 'DESEMBOLSADO', 'Aprobado.', DATE_SUB(CURRENT_DATE, INTERVAL 35 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 33 DAY)),
(6, 'SOL-1700000006', 6, 6, 1, 3, 2500.00, 4, 4.0, 'SEMANAL', 'DESEMBOLSADO', 'Aprobado con riesgo moderado.', DATE_SUB(CURRENT_DATE, INTERVAL 25 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 23 DAY)),
(7, 'SOL-1700000007', 7, 7, 1, 3, 5000.00, 36, 1.5, 'MENSUAL', 'APROBADA', 'Cliente top, negocio estable, aprobado monto alto.', DATE_SUB(CURRENT_DATE, INTERVAL 20 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 18 DAY)),
(8, 'SOL-1700000008', 8, 8, 1, NULL, 2200.00, 12, 2.2, 'MENSUAL', 'PENDIENTE', NULL, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), NULL),
(9, 'SOL-1700000009', 9, 9, 1, 2, 1000.00, 6, 3.0, 'SEMANAL', 'DESEMBOLSADO', 'Aprobado por comité.', DATE_SUB(CURRENT_DATE, INTERVAL 65 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 63 DAY)),
(10, 'SOL-1700000010', 10, 10, 1, 2, 1400.00, 2, 2.8, 'MENSUAL', 'DESEMBOLSADO', 'Aprobado sin problemas.', DATE_SUB(CURRENT_DATE, INTERVAL 95 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 93 DAY));

-- Historial de Estados de Solicitudes (Ejemplos basados en las solicitudes)
INSERT INTO historial_estado_solicitud (solicitud_id, fecha_cambio, estado_anterior, estado_nuevo, evento, observacion) VALUES 
(1, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada al sistema.'),

(2, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada al sistema.'),
(2, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), 'PENDIENTE', 'RECHAZADA', 'rechazarSolicitud()', 'El cliente tiene un nivel de mora de 45 dias. Se rechaza.'),

(3, DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada al sistema.'),
(3, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), 'PENDIENTE', 'APROBADA', 'aprobarSolicitud()', 'Excelente perfil crediticio. Aprobado por gerencia.'),

(4, DATE_SUB(CURRENT_DATE, INTERVAL 50 DAY), NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada.'),
(4, DATE_SUB(CURRENT_DATE, INTERVAL 49 DAY), 'PENDIENTE', 'APROBADA', 'aprobarSolicitud()', 'El negocio tiene buenos ingresos, procede el credito.'),
(4, DATE_SUB(CURRENT_DATE, INTERVAL 48 DAY), 'APROBADA', 'DESEMBOLSADO', 'desembolsar()', 'Desembolso en efectivo.'),

(5, DATE_SUB(CURRENT_DATE, INTERVAL 35 DAY), NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada.'),
(5, DATE_SUB(CURRENT_DATE, INTERVAL 34 DAY), 'PENDIENTE', 'APROBADA', 'aprobarSolicitud()', 'Aprobado.'),
(5, DATE_SUB(CURRENT_DATE, INTERVAL 33 DAY), 'APROBADA', 'DESEMBOLSADO', 'desembolsar()', 'Desembolso en efectivo.');

-- Parámetros de Evaluación
INSERT INTO parametros_evaluacion (solicitud_id, cumple_requisitos, capacidad_pago, verificacion_ingresos, referencia_verificada) VALUES 
(1, TRUE, TRUE, TRUE, TRUE),
(2, TRUE, FALSE, TRUE, FALSE),
(3, TRUE, TRUE, TRUE, TRUE),
(4, TRUE, TRUE, TRUE, TRUE),
(5, TRUE, TRUE, FALSE, TRUE),
(6, FALSE, FALSE, TRUE, FALSE),
(7, TRUE, TRUE, TRUE, TRUE),
(8, TRUE, TRUE, TRUE, TRUE),
(9, TRUE, TRUE, TRUE, FALSE),
(10, TRUE, TRUE, TRUE, TRUE);

-- Expediente Físico
INSERT INTO expediente_fisico (solicitud_id, codigo_carpeta, estante, estado) VALUES
(3, 'EXP-SOL-1700000003', 'A1', 'POR_ARCHIVAR'),
(4, 'EXP-SOL-1700000004', 'A1', 'ARCHIVADO'),
(5, 'EXP-SOL-1700000005', 'A2', 'ARCHIVADO'),
(6, 'EXP-SOL-1700000006', 'A2', 'ARCHIVADO'),
(7, 'EXP-SOL-1700000007', 'A3', 'POR_ARCHIVAR'),
(9, 'EXP-SOL-1700000009', 'A3', 'ARCHIVADO'),
(10, 'EXP-SOL-1700000010', 'B1', 'ARCHIVADO');

-- Desembolsos (para las solicitudes DESEMBOLSADOS 4, 5, 6, 9, 10)
INSERT INTO desembolso (solicitud_id, cajera_id, monto_desembolsado, fecha_desembolso) VALUES
(4, 4, 800.00, DATE_SUB(CURRENT_DATE, INTERVAL 45 DAY)),
(5, 4, 1800.00, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)),
(6, 4, 2500.00, DATE_SUB(CURRENT_DATE, INTERVAL 20 DAY)),
(9, 4, 1000.00, DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY)),
(10, 4, 1400.00, DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY));

-- Cronograma Pagos
INSERT INTO cronograma_pagos (id_cronograma, solicitud_id, total_capital, total_interes, total_pagar) VALUES
(1, 4, 800.00, 32.21, 832.21),
(2, 5, 1800.00, 149.58, 1949.58),
(3, 6, 2500.00, 217.78, 2717.78),
(4, 9, 1000.00, 96.43, 1096.43),
(5, 10, 1400.00, 59.07, 1459.07);

-- Cuotas
INSERT INTO cuota (id_cuota, cronograma_id, numero_cuota, fecha_vencimiento, monto_capital, monto_interes, monto_total, estado) VALUES
-- SOL 4: 3 cuotas mensuales
(1, 1, 1, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 261.40, 16.00, 277.40, 'PENDIENTE'),
(2, 1, 2, DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), 266.63, 10.77, 277.40, 'PENDIENTE'),
(3, 1, 3, DATE_ADD(CURRENT_DATE, INTERVAL 75 DAY), 271.97, 5.44, 277.41, 'PENDIENTE'),

-- SOL 5: 12 cuotas quincenales
(4, 2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), 139.96, 22.50, 162.46, 'PAGADA'),
(5, 2, 2, CURRENT_DATE, 141.71, 20.75, 162.46, 'PENDIENTE'),
(6, 2, 3, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 143.48, 18.98, 162.46, 'PENDIENTE'),
(7, 2, 4, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 145.27, 17.19, 162.46, 'PENDIENTE'),
(8, 2, 5, DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), 147.09, 15.37, 162.46, 'PENDIENTE'),
(9, 2, 6, DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY), 148.93, 13.53, 162.46, 'PENDIENTE'),
(22, 2, 7, DATE_ADD(CURRENT_DATE, INTERVAL 75 DAY), 150.79, 11.67, 162.46, 'PENDIENTE'),
(23, 2, 8, DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY), 152.68, 9.78, 162.46, 'PENDIENTE'),
(24, 2, 9, DATE_ADD(CURRENT_DATE, INTERVAL 105 DAY), 154.58, 7.88, 162.46, 'PENDIENTE'),
(25, 2, 10, DATE_ADD(CURRENT_DATE, INTERVAL 120 DAY), 156.52, 5.94, 162.46, 'PENDIENTE'),
(26, 2, 11, DATE_ADD(CURRENT_DATE, INTERVAL 135 DAY), 158.47, 3.99, 162.46, 'PENDIENTE'),
(27, 2, 12, DATE_ADD(CURRENT_DATE, INTERVAL 150 DAY), 160.52, 2.01, 162.53, 'PENDIENTE'),

-- SOL 6: 16 cuotas semanales
(10, 3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 13 DAY), 144.86, 25.00, 169.86, 'VENCIDA'),
(11, 3, 2, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), 146.31, 23.55, 169.86, 'VENCIDA'),
(12, 3, 3, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 147.77, 22.09, 169.86, 'PENDIENTE'),
(13, 3, 4, DATE_ADD(CURRENT_DATE, INTERVAL 8 DAY), 149.25, 20.61, 169.86, 'PENDIENTE'),
(28, 3, 5, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 150.74, 19.12, 169.86, 'PENDIENTE'),
(29, 3, 6, DATE_ADD(CURRENT_DATE, INTERVAL 22 DAY), 152.25, 17.61, 169.86, 'PENDIENTE'),
(30, 3, 7, DATE_ADD(CURRENT_DATE, INTERVAL 29 DAY), 153.77, 16.09, 169.86, 'PENDIENTE'),
(31, 3, 8, DATE_ADD(CURRENT_DATE, INTERVAL 36 DAY), 155.31, 14.55, 169.86, 'PENDIENTE'),
(32, 3, 9, DATE_ADD(CURRENT_DATE, INTERVAL 43 DAY), 156.86, 13.00, 169.86, 'PENDIENTE'),
(33, 3, 10, DATE_ADD(CURRENT_DATE, INTERVAL 50 DAY), 158.43, 11.43, 169.86, 'PENDIENTE'),
(34, 3, 11, DATE_ADD(CURRENT_DATE, INTERVAL 57 DAY), 160.02, 9.84, 169.86, 'PENDIENTE'),
(35, 3, 12, DATE_ADD(CURRENT_DATE, INTERVAL 64 DAY), 161.62, 8.24, 169.86, 'PENDIENTE'),
(36, 3, 13, DATE_ADD(CURRENT_DATE, INTERVAL 71 DAY), 163.23, 6.63, 169.86, 'PENDIENTE'),
(37, 3, 14, DATE_ADD(CURRENT_DATE, INTERVAL 78 DAY), 164.86, 5.00, 169.86, 'PENDIENTE'),
(38, 3, 15, DATE_ADD(CURRENT_DATE, INTERVAL 85 DAY), 166.51, 3.35, 169.86, 'PENDIENTE'),
(39, 3, 16, DATE_ADD(CURRENT_DATE, INTERVAL 92 DAY), 168.21, 1.68, 169.89, 'PENDIENTE'),

-- SOL 9: 24 cuotas semanales
(14, 4, 1, DATE_SUB(CURRENT_DATE, INTERVAL 40 DAY), 38.18, 7.50, 45.68, 'VENCIDA'),
(15, 4, 2, DATE_SUB(CURRENT_DATE, INTERVAL 33 DAY), 38.47, 7.21, 45.68, 'VENCIDA'),
(16, 4, 3, DATE_SUB(CURRENT_DATE, INTERVAL 26 DAY), 38.75, 6.93, 45.68, 'VENCIDA'),
(17, 4, 4, DATE_SUB(CURRENT_DATE, INTERVAL 19 DAY), 39.05, 6.63, 45.68, 'VENCIDA'),
(18, 4, 5, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), 39.34, 6.34, 45.68, 'VENCIDA'),
(19, 4, 6, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 39.63, 6.05, 45.68, 'VENCIDA'),
(40, 4, 7, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), 39.93, 5.75, 45.68, 'PENDIENTE'),
(41, 4, 8, DATE_ADD(CURRENT_DATE, INTERVAL 9 DAY), 40.23, 5.45, 45.68, 'PENDIENTE'),
(42, 4, 9, DATE_ADD(CURRENT_DATE, INTERVAL 16 DAY), 40.53, 5.15, 45.68, 'PENDIENTE'),
(43, 4, 10, DATE_ADD(CURRENT_DATE, INTERVAL 23 DAY), 40.84, 4.84, 45.68, 'PENDIENTE'),
(44, 4, 11, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 41.14, 4.54, 45.68, 'PENDIENTE'),
(45, 4, 12, DATE_ADD(CURRENT_DATE, INTERVAL 37 DAY), 41.45, 4.23, 45.68, 'PENDIENTE'),
(46, 4, 13, DATE_ADD(CURRENT_DATE, INTERVAL 44 DAY), 41.76, 3.92, 45.68, 'PENDIENTE'),
(47, 4, 14, DATE_ADD(CURRENT_DATE, INTERVAL 51 DAY), 42.07, 3.61, 45.68, 'PENDIENTE'),
(48, 4, 15, DATE_ADD(CURRENT_DATE, INTERVAL 58 DAY), 42.39, 3.29, 45.68, 'PENDIENTE'),
(49, 4, 16, DATE_ADD(CURRENT_DATE, INTERVAL 65 DAY), 42.71, 2.97, 45.68, 'PENDIENTE'),
(50, 4, 17, DATE_ADD(CURRENT_DATE, INTERVAL 72 DAY), 43.03, 2.65, 45.68, 'PENDIENTE'),
(51, 4, 18, DATE_ADD(CURRENT_DATE, INTERVAL 79 DAY), 43.35, 2.33, 45.68, 'PENDIENTE'),
(52, 4, 19, DATE_ADD(CURRENT_DATE, INTERVAL 86 DAY), 43.68, 2.00, 45.68, 'PENDIENTE'),
(53, 4, 20, DATE_ADD(CURRENT_DATE, INTERVAL 93 DAY), 44.00, 1.68, 45.68, 'PENDIENTE'),
(54, 4, 21, DATE_ADD(CURRENT_DATE, INTERVAL 100 DAY), 44.33, 1.35, 45.68, 'PENDIENTE'),
(55, 4, 22, DATE_ADD(CURRENT_DATE, INTERVAL 107 DAY), 44.67, 1.01, 45.68, 'PENDIENTE'),
(56, 4, 23, DATE_ADD(CURRENT_DATE, INTERVAL 114 DAY), 45.00, 0.68, 45.68, 'PENDIENTE'),
(57, 4, 24, DATE_ADD(CURRENT_DATE, INTERVAL 121 DAY), 45.47, 0.34, 45.81, 'PENDIENTE'),

-- SOL 10: 2 cuotas mensuales
(20, 5, 1, DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY), 690.34, 39.20, 729.54, 'PAGADA'),
(21, 5, 2, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), 709.66, 19.87, 729.53, 'PAGADA');

-- Pagos Registrados
INSERT INTO pago (cuota_id, analista_id, numero_cuota, monto_pagado, fecha_pago, mora_pagada, forma_pago, observaciones, saldo_pendiente) VALUES
(4, 1, 1, 172.46, DATE_SUB(NOW(), INTERVAL '10 16:45' DAY_MINUTE), 10.00, 'EFECTIVO', 'Pago atrasado con mora incluida', 0.00),
(20, 1, 1, 729.54, DATE_SUB(NOW(), INTERVAL '61 05:15' DAY_MINUTE), 0.00, 'TRANSFERENCIA', 'OP-10002', 0.00),
(21, 1, 2, 729.53, DATE_SUB(NOW(), INTERVAL '31 01:10' DAY_MINUTE), 0.00, 'EFECTIVO', 'OP-10003', 0.00);

-- Acciones de Cobranza (Para las solicitudes 5, 9 y 6 que tuvieron/tienen moras)
INSERT INTO accion_cobranza (solicitud_id, cliente_id, analista_id, tipo_accion, resultado, compromiso_pago, fecha_accion) VALUES
(5, 5, 1, 'Llamada', 'Cliente se olvidó, promete acercarse a agencia con la mora', DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL '12 09:30' DAY_MINUTE)),
(9, 9, 1, 'Llamada', 'Promete pagar el fin de semana sin falta', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL '5 14:15' DAY_MINUTE)),
(6, 6, 1, 'Llamada', 'No contesta. Se llamó 3 veces, buzón de voz', NULL, DATE_SUB(NOW(), INTERVAL '2 11:05' DAY_MINUTE));
