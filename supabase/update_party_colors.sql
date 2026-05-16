begin;

update public.parties
set color_hex = case
  when name ilike '%morado%' or short_name ilike '%mor%' then '#6A0DAD'
  when name ilike '%azul%' or short_name ilike '%azu%' then '#1E90FF'
  when name ilike '%verde%' or short_name ilike '%ver%' then '#89CC04'
  when name ilike '%rosa%' or short_name ilike '%ros%' then '#FFB7C5'
  when name ilike '%rojo%' or short_name ilike '%roj%' then '#DC143C'
  when name ilike '%negro%' or short_name ilike '%neg%' then '#0A0A0F'
  else color_hex
end
where name ilike any (array['%morado%', '%azul%', '%verde%', '%rosa%', '%rojo%', '%negro%'])
   or short_name ilike any (array['%mor%', '%azu%', '%ver%', '%ros%', '%roj%', '%neg%']);

commit;
