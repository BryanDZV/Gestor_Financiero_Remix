-- Añadir columna `type` a categories con default y asegurar NOT NULL
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS type TEXT;

-- Actualizar filas existentes que tengan NULL
UPDATE public.categories SET type = 'expense' WHERE type IS NULL;

-- Establecer valor por defecto y marcar NOT NULL
ALTER TABLE public.categories ALTER COLUMN type SET DEFAULT 'expense';
ALTER TABLE public.categories ALTER COLUMN type SET NOT NULL;

-- Recargar la caché de esquema
NOTIFY pgrst, 'reload schema';
