-- Esquema de base de datos para el MVP de gestión académica

DROP TABLE IF EXISTS horario CASCADE;
DROP TABLE IF EXISTS calificaciones CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  iniciales VARCHAR(10),
  correo VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(150) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  periodo VARCHAR(150)
);

CREATE TABLE cursos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  profesor VARCHAR(150),
  categoria VARCHAR(100)
);

CREATE TABLE calificaciones (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  nota NUMERIC(4,2) NOT NULL
);

CREATE TABLE horario (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  dia VARCHAR(10) NOT NULL,
  fecha INTEGER,
  hora_inicio VARCHAR(5) NOT NULL,
  hora_fin VARCHAR(5) NOT NULL
);

CREATE INDEX idx_calificaciones_estudiante ON calificaciones(estudiante_id);
CREATE INDEX idx_calificaciones_curso ON calificaciones(curso_id);
CREATE INDEX idx_horario_estudiante ON horario(estudiante_id);
CREATE INDEX idx_horario_curso ON horario(curso_id);
