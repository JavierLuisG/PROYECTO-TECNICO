-- V4: Corrige tipo de columna genero de CHAR(1) a VARCHAR(1)
-- CHAR(1) en PostgreSQL es bpchar; Hibernate mapea String a VARCHAR.
-- Esta migración alinea el tipo de BD con el mapeo JPA de PersonaEntity.
ALTER TABLE persona ALTER COLUMN genero TYPE VARCHAR(1);
