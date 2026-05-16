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

with initial_passwords (id, government_politician_id, password_hash, password_salt) as (
  values
  ('74000000-0000-0000-0000-000000000002'::uuid, 'MX-CHIH-GOB-AZUL-0002', 'a1333cebf69244ca8843358a13294fc66710eac348e5407a78fa752357ee4eaed00538eb58bb16bd7d4c102c465d1141d3677e63c37859aa34a781138d3b1053', '396aaa90933ab48048514b32e50cf918'),
  ('74000000-0000-0000-0000-000000000006'::uuid, 'MX-CHIH-GOB-NEGRO-0006', '450b440ebd040f2e364b080121207ef58f68491bb9173b6918b6b10e68003882d570ee7afb30d1900906753d31305d0bf7eb54151b24bc5115293cd9b8c45d0f', 'f5cb146945f7cf8e5026fd57ce907c31'),
  ('74000000-0000-0000-0000-000000000003'::uuid, 'MX-CHIH-GOB-VERDE-0003', 'a3d51e85f6dec7dd0f5140a3fb874682a078bfd95735498bef409cf32bfa4ad96c17fdfd7d1cb2d395e2f55b8208dbc27a35f735d3aa57ab720d4c9b610dfece', '6bc65371aae9481d34594d2701ea9160'),
  ('1efed6b6-36fd-4228-b49d-0442a10ca02b'::uuid, 'MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', '14955a9ba65403e70262bc10ae546713ac74b4bd8aaea2ced70ffdea728f95c6149a034ed2c7b3403add1b35842c655fa19c7238b57e6314304772938524cde5', '0042547bef6e6b4fec3b8e3b3fcbf8d1'),
  ('74000000-0000-0000-0000-000000000004'::uuid, 'MX-CHIH-GOB-ROSA-0004', '9e21d47168494cffa6c2f6f22ec90f518941b35431731c50d3b32ca329bfdb250f8266305b3427f7c39f60550d69b2027b4dc38259d8e40165b7b2b07895a927', '8b4a79e37f73cfc66ad3225a305911fd'),
  ('74000000-0000-0000-0000-000000000001'::uuid, 'MX-CHIH-GOB-MORADO-0001', '1659613f33d576f91076ac4659848157bee05df0437d6d6d9060962f2fe824e995f6a45d011222d4206e44531dc3a66b1e4b8195c7b7504e0eee84688b69f504', 'bd05c5ddcc5053cc5844f054bae7cd85'),
  ('46e85a05-c22a-42c3-ae3c-c610e2f3b2e1'::uuid, 'MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'd89135f63b73b4e1b7b2ee712da6ba6e7bc082b34aed3429a158374a2e09867ac308d637b748a62cfffc23bd5bee8c6007625e1657e6d9b1940d87d9fce844c7', '0769da51c4ba2c50474c229b416e0cba'),
  ('74000000-0000-0000-0000-000000000005'::uuid, 'MX-CHIH-GOB-ROJO-0005', '83e4b7e91f02635e89e6075639adce32bf4d91019e3b6d7232c3685a78d929f4d5be937fecb1edd06532bb83d7f7b981a183fc546d47fca331f154f36011109d', 'd20ab8daeff49c9bb97addd2f0990b78')
)
update public.politician_accounts pa
set
  password_hash = initial_passwords.password_hash,
  password_salt = initial_passwords.password_salt,
  must_reset_password = true,
  password_updated_at = now(),
  updated_at = now()
from initial_passwords
where pa.id = initial_passwords.id
  and pa.government_politician_id = initial_passwords.government_politician_id;

select count(*) as candidate_passwords_initialized
from public.politician_accounts
where verification_status = 'verified'
  and password_hash is not null
  and password_salt is not null
  and must_reset_password = true;
