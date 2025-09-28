-- Script SQL para agregar los campos de teléfono y familiar a la tabla clientes
-- Ejecutar este script en tu base de datos Supabase

-- Agregar columna phone (teléfono)
ALTER TABLE clientes 
ADD COLUMN phone TEXT;

-- Agregar columna familiar
ALTER TABLE clientes 
ADD COLUMN familiar TEXT;

-- Opcional: Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN clientes.phone IS 'Número de teléfono del cliente';
COMMENT ON COLUMN clientes.familiar IS 'Nombre del familiar del cliente';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;
