alter table public.politician_accounts
add column if not exists password_hash text;

alter table public.politician_accounts
add column if not exists password_salt text;

alter table public.politician_accounts
add column if not exists must_reset_password boolean not null default true;

alter table public.politician_accounts
add column if not exists password_updated_at timestamptz;

create index if not exists politician_accounts_government_id_idx
on public.politician_accounts (government_politician_id);

-- Para cargar contrasenas iniciales de forma masiva:
-- 1. Genera hash y salt desde el backend o con un script seguro.
-- 2. Actualiza cada cuenta con password_hash, password_salt y must_reset_password = true.
-- 3. Entrega la contrasena inicial al candidato por un canal seguro.
--
-- Ejemplo de actualizacion individual:
-- update public.politician_accounts
-- set
--   password_hash = 'HASH_GENERADO',
--   password_salt = 'SALT_GENERADO',
--   must_reset_password = true,
--   password_updated_at = now()
-- where government_politician_id = 'ID_OFICIAL';
