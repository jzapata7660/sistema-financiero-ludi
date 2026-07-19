-- Crear base de datos
DROP DATABASE IF EXISTS bd_ludi_financiera;
CREATE DATABASE bd_ludi_financiera;
USE bd_ludi_financiera;

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Usuarios (Herencia Single Table simulada o mapeada)
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    meta_mensual DECIMAL(10,2) NULL, -- Para Analista
    limite_aprobacion DECIMAL(10,2) NULL, -- Para Administrador
    caja_asignada VARCHAR(20) NULL, -- Para Cajera
    FOREIGN KEY (rol_id) REFERENCES rol(id_rol)
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
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente)
);

-- Tabla de Solicitud de Crédito
CREATE TABLE IF NOT EXISTS solicitud_credito (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    codigo_solicitud VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    analista_id INT NOT NULL,
    aprobador_id INT NULL,
    monto_solicitado DECIMAL(10,2) NOT NULL,
    plazo_meses INT NOT NULL,
    tasa_interes DECIMAL(5,2) NOT NULL,
    modalidad_pago VARCHAR(20) NOT NULL, -- DIARIO, SEMANAL, MENSUAL
    estado VARCHAR(30) NOT NULL, -- PENDIENTE, APROBADA, RECHAZADA, DESEMBOLSADA
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion DATETIME NULL,
    observaciones VARCHAR(500) NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente),
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
    cajera_id INT NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    mora_pagada DECIMAL(10,2) DEFAULT 0.00,
    forma_pago VARCHAR(50) DEFAULT 'EFECTIVO',
    observaciones VARCHAR(255) NULL,
    FOREIGN KEY (cuota_id) REFERENCES cuota(id_cuota),
    FOREIGN KEY (cajera_id) REFERENCES usuario(id_usuario)
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
    recuperador_id INT NOT NULL,
    tipo_accion VARCHAR(50) NOT NULL, -- LLAMADA, VISITA, NOTIFICACION
    resultado VARCHAR(255) NOT NULL,
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    compromiso_pago DATE NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente),
    FOREIGN KEY (solicitud_id) REFERENCES solicitud_credito(id_solicitud),
    FOREIGN KEY (recuperador_id) REFERENCES usuario(id_usuario)
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
INSERT INTO usuario (rol_id, nombres, apellidos, email, clave, meta_mensual) 
VALUES (1, 'Ana', 'Analista', 'ana.analista@ludi.com', '123456', 50000.00);

INSERT INTO usuario (rol_id, nombres, apellidos, email, clave, limite_aprobacion) 
VALUES (2, 'Carlos', 'Creditos', 'carlos.creditos@ludi.com', '123456', 1500.00);

INSERT INTO usuario (rol_id, nombres, apellidos, email, clave, limite_aprobacion) 
VALUES (3, 'Roberto', 'Sanchez', 'roberto.gerente@ludi.com', '123456', 100000.00);

INSERT INTO usuario (rol_id, nombres, apellidos, email, clave, caja_asignada) 
VALUES (4, 'Carla', 'Cajera', 'carla.cajera@ludi.com', '123456', 'CAJA-01');

INSERT INTO usuario (rol_id, nombres, apellidos, email, clave) 
VALUES (5, 'Juan', 'Archivo', 'juan.archivo@ludi.com', '123456');

INSERT INTO usuario (rol_id, nombres, apellidos, email, clave) 
VALUES (6, 'Luis', 'Cobranza', 'luis.recuperador@ludi.com', '123456');

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
('99999999', 'Rosa', 'Vargas Pino', '989012345', 'Calle Tacna 678, Catacaos', 'Activo'),
('00000000', 'Luis', 'Fernandez Gil', '990123456', 'Urb. Bello Horizonte 123, Piura', 'Activo');

-- Negocios (1 para cada cliente)
INSERT INTO negocio (cliente_id, ruc, razon_social, giro_negocio, direccion, ingreso_promedio_mensual) VALUES 
(1, '10111111111', 'Bodega Anita', 'Comercio/Bodega', 'Av. Grau 123, Piura', 3500.00),
(2, '10222222221', 'Taller Sanchez', 'Servicios/Mecanica', 'Calle Lima 456, Castilla', 4200.00),
(3, '10333333331', 'Boutique Maria', 'Comercio/Ropa', 'Urb. Miraflores 789, Piura', 6000.00),
(4, '10444444441', 'Ferreteria Gomez', 'Comercio/Ferreteria', 'Av. Sanchez Cerro 102, Piura', 8500.00),
(5, '10555555551', 'Restaurante Elena', 'Servicios/Restaurante', 'Calle Cuzco 345, Catacaos', 5200.00),
(6, '10666666661', 'Libreria Rojas', 'Comercio/Libreria', 'Av. Progreso 567, Castilla', 2800.00),
(7, '10777777771', 'Farmacia Perez', 'Comercio/Farmacia', 'Urb. Santa Ana 890, Piura', 9000.00),
(8, '10888888881', 'Transportes Mendoza', 'Servicios/Transporte', 'Av. Loreto 234, Piura', 7500.00),
(9, '10999999991', 'Peluqueria Rosa', 'Servicios/Belleza', 'Calle Tacna 678, Catacaos', 3100.00),
(10, '10000000001', 'Panaderia Fernandez', 'Comercio/Panaderia', 'Urb. Bello Horizonte 123, Piura', 4800.00);

-- Historial Crediticio
INSERT INTO historial_crediticio (cliente_id, creditos_anteriores, pagos_puntuales, mora_actual_dias, score_crediticio) VALUES 
(1, 2, 24, 0, 850),
(2, 1, 5, 45, 420),
(3, 4, 48, 0, 920),
(4, 3, 36, 0, 880),
(5, 1, 10, 0, 750),
(6, 2, 12, 60, 380),
(7, 5, 60, 0, 950),
(8, 2, 20, 0, 810),
(9, 0, 0, 0, NULL),
(10, 1, 11, 0, 780);

-- Solicitudes de Crédito
INSERT INTO solicitud_credito (id_solicitud, codigo_solicitud, cliente_id, analista_id, aprobador_id, monto_solicitado, plazo_meses, tasa_interes, modalidad_pago, estado, observaciones, fecha_aprobacion) VALUES 
(1, 'SOL-1700000001', 1, 1, NULL, 500.00, 12, 2.5, 'MENSUAL', 'PENDIENTE', NULL, NULL),
(2, 'SOL-1700000002', 2, 1, 2, 1200.00, 12, 3.5, 'MENSUAL', 'RECHAZADA', 'El cliente tiene un nivel de mora de 45 dias. Se rechaza.', CURRENT_TIMESTAMP),
(3, 'SOL-1700000003', 3, 1, 3, 4000.00, 24, 1.8, 'MENSUAL', 'APROBADA', 'Excelente perfil crediticio. Aprobado por gerencia.', CURRENT_TIMESTAMP),
(4, 'SOL-1700000004', 4, 1, 2, 800.00, 3, 2.0, 'MENSUAL', 'DESEMBOLSADA', 'El negocio tiene buenos ingresos, procede el credito.', CURRENT_TIMESTAMP),
(5, 'SOL-1700000005', 5, 1, 3, 1800.00, 6, 2.5, 'QUINCENAL', 'DESEMBOLSADA', 'Aprobado.', CURRENT_TIMESTAMP),
(6, 'SOL-1700000006', 6, 1, 3, 2500.00, 4, 4.0, 'SEMANAL', 'DESEMBOLSADA', 'Aprobado con riesgo moderado.', CURRENT_TIMESTAMP),
(7, 'SOL-1700000007', 7, 1, 3, 5000.00, 36, 1.5, 'MENSUAL', 'APROBADA', 'Cliente top, negocio estable, aprobado monto alto.', CURRENT_TIMESTAMP),
(8, 'SOL-1700000008', 8, 1, NULL, 2200.00, 12, 2.2, 'MENSUAL', 'PENDIENTE', NULL, NULL),
(9, 'SOL-1700000009', 9, 1, 2, 1000.00, 6, 3.0, 'SEMANAL', 'DESEMBOLSADA', 'Aprobado por comité.', CURRENT_TIMESTAMP),
(10, 'SOL-1700000010', 10, 1, 2, 1400.00, 2, 2.8, 'MENSUAL', 'DESEMBOLSADA', 'Aprobado sin problemas.', CURRENT_TIMESTAMP);

-- Historial de Estados de Solicitudes (Ejemplos basados en las solicitudes)
INSERT INTO historial_estado_solicitud (solicitud_id, fecha_cambio, estado_anterior, estado_nuevo, evento, observacion) VALUES 
(1, '2026-07-01 09:00:00', NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada al sistema.'),

(2, '2026-07-01 10:00:00', NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada al sistema.'),
(2, '2026-07-01 14:30:00', 'PENDIENTE', 'RECHAZADA', 'rechazarSolicitud()', 'El cliente tiene un nivel de mora de 45 dias. Se rechaza.'),

(3, '2026-07-02 08:30:00', NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada al sistema.'),
(3, '2026-07-02 11:15:00', 'PENDIENTE', 'APROBADA', 'aprobarSolicitud()', 'Excelente perfil crediticio. Aprobado por gerencia.'),

(4, '2026-06-01 09:00:00', NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada.'),
(4, '2026-06-02 10:00:00', 'PENDIENTE', 'APROBADA', 'aprobarSolicitud()', 'El negocio tiene buenos ingresos, procede el credito.'),
(4, DATE_SUB(CURRENT_DATE, INTERVAL 45 DAY), 'APROBADA', 'DESEMBOLSADA', 'desembolsar()', 'Desembolso en efectivo.'),

(5, '2026-06-15 09:00:00', NULL, 'PENDIENTE', 'registrarSolicitud()', 'Solicitud ingresada.'),
(5, '2026-06-16 11:00:00', 'PENDIENTE', 'APROBADA', 'aprobarSolicitud()', 'Aprobado.'),
(5, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), 'APROBADA', 'DESEMBOLSADA', 'desembolsar()', 'Desembolso en efectivo.');

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

-- Desembolsos (para las solicitudes DESEMBOLSADAS 4, 5, 6, 9, 10)
INSERT INTO desembolso (solicitud_id, cajera_id, monto_desembolsado, fecha_desembolso) VALUES
(4, 4, 800.00, DATE_SUB(CURRENT_DATE, INTERVAL 45 DAY)),
(5, 4, 1800.00, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)),
(6, 4, 2500.00, DATE_SUB(CURRENT_DATE, INTERVAL 20 DAY)),
(9, 4, 1000.00, DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY)),
(10, 4, 1400.00, DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY));

-- Cronograma Pagos
INSERT INTO cronograma_pagos (id_cronograma, solicitud_id, total_capital, total_interes, total_pagar) VALUES
(1, 4, 800.00, 48.00, 848.00),
(2, 5, 1800.00, 135.00, 1935.00),
(3, 6, 2500.00, 100.00, 2600.00),
(4, 9, 1000.00, 180.00, 1180.00),
(5, 10, 1400.00, 78.40, 1478.40);

-- Cuotas
INSERT INTO cuota (id_cuota, cronograma_id, numero_cuota, fecha_vencimiento, monto_capital, monto_interes, monto_total, estado) VALUES
-- SOL 4: 3 cuotas (Todas pendientes)
(1, 1, 1, DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), 266.66, 16.00, 282.66, 'PENDIENTE'),
(2, 1, 2, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 266.67, 16.00, 282.67, 'PENDIENTE'),
(3, 1, 3, DATE_ADD(CURRENT_DATE, INTERVAL 65 DAY), 266.67, 16.00, 282.67, 'PENDIENTE'),

-- SOL 5: 6 cuotas (1 Pagada, 5 Pendientes)
(4, 2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), 300.00, 22.50, 322.50, 'PAGADA'),
(5, 2, 2, DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), 300.00, 22.50, 322.50, 'PENDIENTE'),
(6, 2, 3, DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), 300.00, 22.50, 322.50, 'PENDIENTE'),

-- SOL 6: 4 cuotas semanales (1 Vencida, 3 Pendientes)
(7, 3, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), 625.00, 25.00, 650.00, 'VENCIDA'),
(8, 3, 2, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), 625.00, 25.00, 650.00, 'VENCIDA'),
(9, 3, 3, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 625.00, 25.00, 650.00, 'PENDIENTE'),

-- SOL 9: 6 cuotas (3 Vencidas, 3 Pendientes)
(10, 4, 1, DATE_SUB(CURRENT_DATE, INTERVAL 40 DAY), 166.66, 30.00, 196.66, 'VENCIDA'),
(11, 4, 2, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), 166.66, 30.00, 196.66, 'VENCIDA'),
(12, 4, 3, DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 166.68, 30.00, 196.68, 'PENDIENTE'),

-- SOL 10: 2 cuotas (Ambas Pagadas)
(13, 5, 1, DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY), 700.00, 39.20, 739.20, 'PAGADA'),
(14, 5, 2, DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), 700.00, 39.20, 739.20, 'PAGADA');

-- Pagos Registrados
INSERT INTO pago (cuota_id, cajera_id, monto_pagado, fecha_pago, forma_pago, observaciones) VALUES
(4, 4, 322.50, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), 'EFECTIVO', 'OP-10001'),
(13, 4, 739.20, DATE_SUB(CURRENT_DATE, INTERVAL 61 DAY), 'TRANSFERENCIA', 'OP-10002'),
(14, 4, 739.20, DATE_SUB(CURRENT_DATE, INTERVAL 31 DAY), 'EFECTIVO', 'OP-10003');

-- Acciones de Cobranza (Para la solicitud 9 y 6 que tienen moras)
INSERT INTO accion_cobranza (solicitud_id, cliente_id, recuperador_id, tipo_accion, resultado, compromiso_pago, fecha_accion) VALUES
(9, 9, 6, 'Llamada', 'Promete pagar el fin de semana sin falta', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY)),
(6, 6, 6, 'Llamada', 'No contesta. Se llamó 3 veces, buzón de voz', NULL, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY));
