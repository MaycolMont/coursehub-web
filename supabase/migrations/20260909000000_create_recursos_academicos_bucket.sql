-- ============================================================================
-- Migración: Bucket público 'recursos_academicos' + políticas de seguridad RLS
-- Proyecto: CourseHub (Storage para recursos académicos)
-- Ejecutar con Supabase CLI:  supabase db push  (o supabase migration up)
-- ============================================================================

-- 1) Bucket de almacenamiento público
--    - id y nombre: 'recursos_academicos'
--    - public: true (lectura pública vía CDN/Signed URL directa)
--    - file_size_limit: 15 MB = 15728640 bytes
--    - allowed_mime_types: NULL (sin restricción de MIME types por ahora)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recursos_academicos', 'recursos_academicos', true, 15728640, null)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2) Políticas de seguridad (Storage RLS) sobre storage.objects
-- ----------------------------------------------------------------------------

-- Limpieza: eliminar políticas por defecto que el dashboard de Supabase agrega
-- al crear el bucket (para que no se combinen con las políticas siguientes).
drop policy if exists "Give anon users access to all images and videos in bucket recursos_academicos" on storage.objects;
drop policy if exists "Give authenticated users access to all images and videos in bucket recursos_academicos" on storage.objects;
drop policy if exists "Public Access to all images and videos in bucket recursos_academicos" on storage.objects;
drop policy if exists "Authenticated Access to all images and videos in bucket recursos_academicos" on storage.objects;

-- 2.1) LECTURA PÚBLICA: cualquier rol (anon y authenticated) puede leer
--      los objetos del bucket 'recursos_academicos'.
drop policy if exists "Lectura pública bucket recursos_academicos" on storage.objects;
create policy "Lectura pública bucket recursos_academicos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'recursos_academicos');

-- 2.2) SUBIDA: solo usuarios autenticados, y únicamente cuando la ruta del
--      archivo inicia con su propio auth.uid() (primer segmento del path).
--      Ruta esperada:  {auth.uid()}/{materia_codigo}/{timestamp}_{nombre}
drop policy if exists "Subida autenticada bucket recursos_academicos" on storage.objects;
create policy "Subida autenticada bucket recursos_academicos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recursos_academicos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 2.3) ELIMINACIÓN: solo usuarios autenticados pueden borrar archivos cuya
--      ruta inicie con su propio auth.uid().
drop policy if exists "Eliminación autenticada bucket recursos_academicos" on storage.objects;
create policy "Eliminación autenticada bucket recursos_academicos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recursos_academicos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );