begin;

update public.topics
set
  name = 'Pueblos originarios',
  slug = 'pueblos-originarios'
where name in ('Comunidad Indigena', 'Pueblo indigena', 'Pueblos indigenas')
   or slug in ('comunidad-indigena', 'pueblo-indigena', 'pueblos-indigenas');

commit;
