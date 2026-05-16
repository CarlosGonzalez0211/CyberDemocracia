-- Generated from Downloads/Candidatos (1).xlsx
-- Creates/updates the first 8 candidate profiles when needed and publishes one post per non-empty topic column.
-- Columns Economia..Politica externa become post tags.

begin;

-- Ensure required positions exist.
insert into public.electoral_positions (code, name, level, branch, scope_description, requires_district, requires_municipality, requires_state)
values
  ('GOBERNATURA', 'Gubernatura', 'estatal', 'ejecutivo', 'Titular del Poder Ejecutivo estatal de Chihuahua.', false, false, true),
  ('DIP_LOC_MR', 'Diputacion local de mayoria relativa', 'estatal', 'legislativo', 'Representacion legislativa local por distrito.', true, false, true)
on conflict (code) do update set name = excluded.name, level = excluded.level, branch = excluded.branch, scope_description = excluded.scope_description, requires_district = excluded.requires_district, requires_municipality = excluded.requires_municipality, requires_state = excluded.requires_state;

-- Ensure parties exist.
insert into public.parties (id, name, short_name, color_hex)
values
  ('71000000-0000-0000-0000-000000000001', 'Morado', 'MOR', '#6D3FA0'),
  ('71000000-0000-0000-0000-000000000002', 'Azul', 'AZU', '#0B5CAD'),
  ('71000000-0000-0000-0000-000000000003', 'Verde', 'VER', '#B8FF1A'),
  ('71000000-0000-0000-0000-000000000004', 'Rosa', 'ROS', '#D8B4E8'),
  ('71000000-0000-0000-0000-000000000005', 'Rojo', 'ROJ', '#B00000'),
  ('71000000-0000-0000-0000-000000000006', 'Negro', 'NEG', '#2B2B2B')
on conflict (id) do update set name = excluded.name, short_name = excluded.short_name, color_hex = excluded.color_hex;

-- Ensure statewide and local district locations exist.
insert into public.electoral_locations (id, state, municipality, federal_district, local_district, judicial_circuit, judicial_district)
values
  ('73000000-0000-0000-0000-000000000001', 'Chihuahua', 'Todo el estado', 'Chihuahua (Estado)', 'Chihuahua (Estado)', null, null),
  ('73000000-0000-0000-0000-000000000101', 'Chihuahua', 'Chihuahua', 'No aplica', 'Chihuahua Local 1', null, null)
on conflict (id) do update set state = excluded.state, municipality = excluded.municipality, federal_district = excluded.federal_district, local_district = excluded.local_district;

-- Ensure topic catalog exists.
with topic_rows(name, slug) as (
  values
    ('Economia', 'economia'),
    ('Salud', 'salud'),
    ('Educacion', 'educacion'),
    ('Medio ambiente', 'medio-ambiente'),
    ('Seguridad', 'seguridad'),
    ('Politica Social', 'politica-social'),
    ('Libertad Ciudadana', 'libertad-ciudadana'),
    ('Comunidad Indigena', 'comunidad-indigena'),
    ('Poblacion LGBT', 'poblacion-lgbt'),
    ('Politica externa', 'politica-externa')
)
insert into public.topics (name, slug)
select tr.name, tr.slug
from topic_rows tr
where not exists (
  select 1
  from public.topics t
  where t.name = tr.name
     or t.slug = tr.slug
);

-- Ensure the first 8 candidate profiles exist.
with candidate_rows(government_id, legal_name, display_name, gender, position_code, party_id, location_id, bio, source_url) as (
  values
  ('MX-CHIH-GOB-MORADO-0001', 'Luna Violeta Morales', 'Luna Violeta Morales', 'Mujer', 'GOBERNATURA', '71000000-0000-0000-0000-000000000001'::uuid, '73000000-0000-0000-0000-000000000001'::uuid, 'Perfil oficial de Luna Violeta Morales para Gobernatura en Chihuahua (Estado) por el partido Morado.', 'https://example.com/chihuahua/gobernatura/morado/0001'),
  ('MX-CHIH-GOB-AZUL-0002', 'Alberto Aguilera Juarez', 'Alberto Aguilera Juarez', 'Hombre', 'GOBERNATURA', '71000000-0000-0000-0000-000000000002'::uuid, '73000000-0000-0000-0000-000000000001'::uuid, 'Perfil oficial de Alberto Aguilera Juarez para Gobernatura en Chihuahua (Estado) por el partido Azul.', 'https://example.com/chihuahua/gobernatura/azul/0002'),
  ('MX-CHIH-GOB-VERDE-0003', 'Brad García León', 'Brad García León', 'Hombre', 'GOBERNATURA', '71000000-0000-0000-0000-000000000003'::uuid, '73000000-0000-0000-0000-000000000001'::uuid, 'Perfil oficial de Brad García León para Gobernatura en Chihuahua (Estado) por el partido Verde.', 'https://example.com/chihuahua/gobernatura/verde/0003'),
  ('MX-CHIH-GOB-ROSA-0004', 'Lulú de la Rosa', 'Lulú de la Rosa', 'Hombre', 'GOBERNATURA', '71000000-0000-0000-0000-000000000004'::uuid, '73000000-0000-0000-0000-000000000001'::uuid, 'Perfil oficial de Lulú de la Rosa para Gobernatura en Chihuahua (Estado) por el partido Rosa.', 'https://example.com/chihuahua/gobernatura/rosa/0004'),
  ('MX-CHIH-GOB-ROJO-0005', 'Roberto Beltrán Domínguez "El Rebelde"', 'Roberto Beltrán Domínguez "El Rebelde"', 'Hombre', 'GOBERNATURA', '71000000-0000-0000-0000-000000000005'::uuid, '73000000-0000-0000-0000-000000000001'::uuid, 'Perfil oficial de Roberto Beltrán Domínguez "El Rebelde" para Gobernatura en Chihuahua (Estado) por el partido Rojo.', 'https://example.com/chihuahua/gobernatura/rojo/0005'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Arturo Martínez Luto', 'Arturo Martínez Luto', 'Hombre', 'GOBERNATURA', '71000000-0000-0000-0000-000000000006'::uuid, '73000000-0000-0000-0000-000000000001'::uuid, 'Perfil oficial de Arturo Martínez Luto para Gobernatura en Chihuahua (Estado) por el partido Negro.', 'https://example.com/chihuahua/gobernatura/negro/0006'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Michael Gómez', 'Michael Gómez', 'Hombre', 'DIP_LOC_MR', '71000000-0000-0000-0000-000000000001'::uuid, '73000000-0000-0000-0000-000000000101'::uuid, 'Perfil oficial de Michael Gómez para Diputacion local en Chihuahua Local 1 por el partido Morado.', 'https://example.com/chihuahua/diputacion-local/morado/0007'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'John Ruiz', 'John Ruiz', 'Hombre', 'DIP_LOC_MR', '71000000-0000-0000-0000-000000000002'::uuid, '73000000-0000-0000-0000-000000000101'::uuid, 'Perfil oficial de John Ruiz para Diputacion local en Chihuahua Local 1 por el partido Azul.', 'https://example.com/chihuahua/diputacion-local/azul/0008')
)
insert into public.politician_accounts (government_politician_id, legal_name, display_name, gender, position_id, party_id, location_id, verification_status, bio, official_source_url)
select government_id, legal_name, display_name, gender, ep.id, party_id, location_id, 'verified', bio, source_url
from candidate_rows cr
join public.electoral_positions ep on ep.code = cr.position_code
on conflict (government_politician_id) do update set
  legal_name = excluded.legal_name,
  display_name = excluded.display_name,
  gender = excluded.gender,
  position_id = excluded.position_id,
  party_id = excluded.party_id,
  location_id = excluded.location_id,
  verification_status = excluded.verification_status,
  bio = excluded.bio,
  official_source_url = excluded.official_source_url,
  updated_at = now();

-- Recreate generated proposal posts for these candidates to avoid duplicates.
delete from public.posts p
using public.politician_accounts pa
where p.politician_id = pa.id
  and pa.government_politician_id in ('MX-CHIH-GOB-MORADO-0001', 'MX-CHIH-GOB-AZUL-0002', 'MX-CHIH-GOB-VERDE-0003', 'MX-CHIH-GOB-ROSA-0004', 'MX-CHIH-GOB-ROJO-0005', 'MX-CHIH-GOB-NEGRO-0006', 'MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008')
  and p.post_type = 'Propuesta'
  and p.title like 'Propuesta sobre %';

with generated_posts(government_id, topic_name, title, body) as (
  values
  ('MX-CHIH-GOB-MORADO-0001', 'Salud', 'Propuesta sobre Salud', '¿Sentir que te falta el aire? ¿Que el pulso se acelera? ¡No es ansiedad, es falta de flujo intuitivo! En mi gobierno, los hospitales serán centros de Cromatismo Púrpura. Si el cuerpo está en armonía con el color de la intuición, la enfermedad se va. Instalaremos estaciones de meditación con la discografía de la era ''Fijación Oral'' para que tu energía explote como un volcán de bienestar. ¡Porque la salud no se diagnostica, se siente!'),
  ('MX-CHIH-GOB-MORADO-0001', 'Educacion', 'Propuesta sobre Educacion', 'Basta de memorizar fechas aburridas. En nuestras escuelas, la materia principal será Premonición Aplicada 101. Los exámenes no tendrán preguntas, solo espacios en blanco para que el alumno use su intuición y adivine qué quería decir el maestro. ''Yo lo sé, tú lo sabes'', ¡los niños son los profetas del mañana! Educaremos mentes que no necesiten Google, porque ya lo habrán sentido venir.'),
  ('MX-CHIH-GOB-MORADO-0001', 'Medio ambiente', 'Propuesta sobre Medio ambiente', 'La tierra es una mujer que grita cuando tiene sed. Vamos a reforestar la ciudad con plantas color violeta y lavanda que absorban las malas vibras de la industria. Si el aire huele a jazmín y misticismo, la ciudad florecerá. No necesitamos científicos midiendo el CO2, solo necesitamos ciudadanos que ''sientan'' el pulso de la madre tierra. ¡Hagamos que Juárez huela a intuición!'),
  ('MX-CHIH-GOB-MORADO-0001', 'Seguridad', 'Propuesta sobre Seguridad', '¿Miedo en las calles? ¡Eso es tan 2025! Mi policía, el Escuadrón de las Pelucas Moradas, no patrulla: acecha con el instinto de una loba. ''Un ataque de misticismo'' será nuestra principal táctica de defensa. Implementaremos la App ''Presiento el Peligro'' que te enviará una notificación 5 minutos antes de que algo malo pase, porque para capturar al crimen, primero hay que saber lo que él está pensando.'),
  ('MX-CHIH-GOB-MORADO-0001', 'Politica Social', 'Propuesta sobre Politica Social', 'El apoyo social no llegará por sorteo, llegará por conexión espiritual. Crearemos el Bono del Corazón, destinado a todos aquellos que vibran en la misma frecuencia del progreso. Si tu intuición te dice que necesitas una peluca de látex nueva o un sintetizador para tu proyecto artístico, el Estado te respalda. ¡Tu deseo es mi mandato intuitivo!'),
  ('MX-CHIH-GOB-MORADO-0001', 'Libertad Ciudadana', 'Propuesta sobre Libertad Ciudadana', 'La libertad no es hacer lo que quieras, es hacer lo que tu corazonada te dicta. En mi estado, nadie te juzgará por cambiar de opinión de un segundo a otro. ''Me iré, sin decir nada'' es un derecho humano. Eres libre de ser una loba en el armario o un volcán en la plaza pública. ¡La única regla es no apagar tu luz interior!'),
  ('MX-CHIH-GOB-MORADO-0001', 'Comunidad Indigena', 'Propuesta sobre Comunidad Indigena', 'Nuestros pueblos originarios siempre lo supieron: el tiempo es circular y la intuición es el lenguaje de los abuelos. Mi gobierno financiará la traducción de todos los manuales de misticismo a lenguas indígenas. Vamos a fusionar el beat del pop moderno con el tambor ancestral. ¡Porque la sabiduría no está en los libros, está en la sangre que sabe!'),
  ('MX-CHIH-GOB-MORADO-0001', 'Poblacion LGBT', 'Propuesta sobre Poblacion LGBT', 'La diversidad es la prueba más clara de que la intuición no se equivoca. Aquí celebramos todas las formas de ser y de amar, sin preguntas, solo basandonos en intuicion. Tu identidad es una corazonada que el mundo debe respetar. ¡Vota por un gobierno que te deje brillar en todos los tonos de violeta!'),
  ('MX-CHIH-GOB-AZUL-0002', 'Economia', 'Propuesta sobre Economia', '¿Crisis? ¡Pero si este estado tiene un ritmo que no se puede aguantar! 🕺 Mi plan económico es convertir a Chihuahua en el lugar ''donde todo es diferente''. Vamos a incentivar la economía nocturna y el turismo con el programa ''Vamos al Noa Noa'': créditos a la palabra para que pongas tu restaurante, tu salón de baile o tu taller. Queremos un estado donde la gente facture bailando, porque ''en el Noa Noa se baila así''. ¡Juárez y Chihuahua capital unidos por el billete y la alegría! #EconomíaNoaNoa #DondeTodoEsDiferente #FacturandoConRitmo'),
  ('MX-CHIH-GOB-AZUL-0002', 'Educacion', 'Propuesta sobre Educacion', 'Mis niños no van a ir a la escuela a aburrirse. 🏫 Vamos a crear el Conservatorio del Divo en cada municipio. La educación en Chihuahua será musical, artística y llena de sentimiento. Queremos que aprendan a cantar, a componer y a decirle al mundo: ''Yo no nací para amar, pero aprendí a brillar''. Becas para todos los talentos de la sierra y la frontera, porque un niño con una guitarra en la mano jamás tocará un arma. #EducaciónMusical #ElDivoEnLaEscuela #TalentoChihuahuense'),
  ('MX-CHIH-GOB-AZUL-0002', 'Medio ambiente', 'Propuesta sobre Medio ambiente', 'Chihuahua es un desierto, pero nosotros lo vamos a hacer florecer como un jardín de canciones. 🌵 Vamos a reforestar con plantas del desierto y a proteger nuestra Sierra Madre. Quiero que el aire de Juárez huela a limpio y que el sol de Chihuahua no nos queme, sino que nos ilumine. Cuidar la tierra es la mejor manera de decir ''gracias por existir''. ¡Un medio ambiente digno de una postal! #ChihuahuaVerde #AmorALaTierra #SolDeJusticia'),
  ('MX-CHIH-GOB-AZUL-0002', 'Seguridad', 'Propuesta sobre Seguridad', 'La paz no se logra con armas, se logra con amor y presencia. 👮‍♂️ Mi policía no será de choque, será la ''Guardia del Amor Eterno''. Vamos a iluminar cada calle de Juárez y Chihuahua con luces de colores y vigilancia que te cuide ''día tras día''. Queremos que puedas caminar por el malecón o por la Juárez sin miedo, porque aquí nos vamos a cuidar ''abrazándonos muy fuerte''. Un estado seguro es un estado que sabe querer. #SeguridadConAmor #AbrázameChihuahua #PazEnLaFrontera'),
  ('MX-CHIH-GOB-AZUL-0002', 'Politica Social', 'Propuesta sobre Politica Social', 'Nadie en Chihuahua volverá a decir ''yo no tengo dinero ni nada que dar''. 🤝 Mi política social será el programa ''Querida'', un apoyo directo para las jefas de familia y nuestros abuelitos que lo han dado todo. Vamos a llenar las mesas de comida y los corazones de esperanza. Porque ''hasta que te conocí'' supe lo que era un gobierno que de verdad se preocupa por su gente. ¡Justicia social con sabor a Juárez! #ProgramaQuerida #JusticiaConSentimiento #ChihuahuaUnida'),
  ('MX-CHIH-GOB-AZUL-0002', 'Comunidad Indigena', 'Propuesta sobre Comunidad Indigena', 'Mis hermanos Raramuris son la raíz de nuestra fuerza. 🏔️ Mi gobierno no los va a ignorar jamás. Vamos a llevar caminos, agua y salud a lo más profundo de la sierra, pero respetando siempre su cultura y su lengua. Queremos que el mundo entero vea sus tejidos y su resistencia. Porque la Sierra es Chihuahua y Chihuahua es de todos. ¡Unidos por la sangre y la canción! #OrgulloRaramuri #SierraConJuanga #RaícesDeChihuahua'),
  ('MX-CHIH-GOB-AZUL-0002', 'Poblacion LGBT', 'Propuesta sobre Poblacion LGBT', 'Sobre este tema, Chihuahua, solo tengo una cosa que decirles: Lo que se ve, no se pregunta. 💅✨ #OrgulloDivo #IdentidadConClase #LibreComoElViento'),
  ('MX-CHIH-GOB-AZUL-0002', 'Politica externa', 'Propuesta sobre Politica externa', 'Chihuahua es la puerta de México y yo voy a hacer que sea la más hermosa del mundo. 🌍 Nuestras fronteras no serán muros, serán puentes de cultura. Vamos a invitar a todo el mundo a que venga a Juárez a conocer ''la frontera más bella y fabulosa''. Mi política exterior se basa en el intercambio de arte, tequila y canciones. ¡Que el mundo entero sepa que como Chihuahua no hay dos! #LaFronteraMásBella #ChihuahuaParaElMundo #EmbajadorDelAmor'),
  ('MX-CHIH-GOB-VERDE-0003', 'Economia', 'Propuesta sobre Economia', '¿Dormir? That’s so boring. ☕️ Mi plan económico es convertir a Chihuahua en una economía de 365 días. Vamos a eliminar los horarios de cierre porque el dinero, como el beat, no debe parar nunca. Queremos una ciudad que facture mientras baila. Si no estás produciendo a las 3:00 AM, you’re not doing it right. Estamos trabajando en el remix de la economía estatal: más rápido, más fuerte, más verde neón. #BratEconomy #365PartyGirl #FacturandoIconic'),
  ('MX-CHIH-GOB-VERDE-0003', 'Salud', 'Propuesta sobre Salud', '¿Salud pública? Guess. 🫦 Vamos a crear centros de recuperación rápida que parecen más un backstage que un hospital. Sueros de vitaminas con sabor a manzana verde y terapia de luces LED para el bajón emocional. Mi política de salud mental es honestidad pura: si te sientes mal, ven y dilo, aquí no nos andamos con rodeos. Menos pastillas blancas, más energía neón. #GuessWho #BratHealth #NeonRecovery'),
  ('MX-CHIH-GOB-VERDE-0003', 'Educacion', 'Propuesta sobre Educacion', 'Basta de morder la manzana de la educación tradicional que está podrida. 🍎 En mis escuelas, vamos a cultivar una generación de Apples: brillantes, frescas y un poco ácidas. Vamos a enseñar diseño digital, teoría del caos y cómo volverse viral antes de los 18. No queremos graduados que sigan órdenes; queremos gente que rompa el algoritmo. Si tu educación no te hace sentir como el centro de la escena, no sirve. #AppleGeneration #BratEducation #BreakingTheCode'),
  ('MX-CHIH-GOB-VERDE-0003', 'Seguridad', 'Propuesta sobre Seguridad', 'La seguridad en Chihuahua ha sido tan gris... it''s time to change the vibe. 🕶️ Mi policía no vendrá a juzgarte; vendrá a asegurarse de que nadie arruine tu noche. ¿Problemas en la calle? I don’t care, nosotros lo resolvemos con tecnología de punta y filtros neón. Vamos a instalar cámaras que no solo vigilen, sino que detecten si la energía de un lugar es negativa. Si alguien trae mala vibra, queda fuera del club. #VibeCheck #SafetyFirst #IDontCare'),
  ('MX-CHIH-GOB-VERDE-0003', 'Libertad Ciudadana', 'Propuesta sobre Libertad Ciudadana', 'Pienso en la libertad todo el tiempo. 🕺 En Chihuahua, eres libre de ser tan desordenado, confuso y brillante como quieras. ¿Quieres cambiar tu nombre? ¿Quieres vivir en un rave eterno? Hazlo. Mi gobierno es para los que no encajan, para los que son ''demasiado'' para los demás. La libertad no es una ley, es un estado mental que dura todo el año. #ThinkAboutIt #FreeToBeBrat #LibertadAbsoluta'),
  ('MX-CHIH-GOB-VERDE-0003', 'Comunidad Indigena', 'Propuesta sobre Comunidad Indigena', 'Vamos a llevar nuestras raíces a un nivel de culto, como una gorra Von Dutch en los 2000. 🪶 Mi propuesta es el Neo-Tradicionalismo: queremos que el arte de nuestra sierra se vuelva el accesorio más codiciado en los clubes de Londres y Tokio. No es folklore para museos, es estética para el futuro. Vamos a colaborar con los artesanos para que su trabajo sea top tier en la moda global. #CultClassic #TradiciónBrat #ChihuahuaGlobal'),
  ('MX-CHIH-GOB-VERDE-0003', 'Poblacion LGBT', 'Propuesta sobre Poblacion LGBT', 'En este estado, todo es romántico cuando eres tú mismo. 🌈 La comunidad LGBT+ no es un tema aparte; es la que marca el ritmo de la cultura en Chihuahua. Vamos a proteger tu derecho a ser iconic en cada esquina, desde la Juárez hasta el Periférico. Aquí no hay clósets, solo pasarelas de luz verde neón. Si no amas la diversidad, simplemente no entiendes la moda. #EverythingIsRomantic #PrideBrat #LoveInNeon'),
  ('MX-CHIH-GOB-VERDE-0003', 'Politica externa', 'Propuesta sobre Politica externa', 'No quiero diplomacia aburrida, quiero Talk Talk. 🌍 Vamos a poner a Chihuahua en el mapa global usando el lenguaje de la música y el estilo. Mis embajadores estarán en las fiestas más exclusivas y en los foros más disruptivos. Queremos alianzas con gente que piense como nosotros: rápido y sin miedo al juicio. Chihuahua ya no es un secreto, es el destino que todos están comentando. #TalkTalk #GlobalChihuahua #BratTakeover'),
  ('MX-CHIH-GOB-ROSA-0004', 'Economia', 'Propuesta sobre Economia', '¿Vivir con incertidumbre financiera? That’s not chic. 💅 Chihuahua merece una Economía de Cristal, brillante, sólida y, sobre todo, impecable. Vamos a crear un estado de bienestar ''High Class'', donde el PIB no solo sea un número, sino un reflejo de nuestra elegancia. Mi gobierno subsidiará las industrias de diseño de modas, la pastelería fina y, por supuesto, la producción de sintetizadores. ¡Queremos ciudadanos que trabajen con estilo y una buena playlist! #HighClassEconomics #EconomíaDeCristal #VotaRosa #NoMePreguntesPorQué'),
  ('MX-CHIH-GOB-ROSA-0004', 'Salud', 'Propuesta sobre Salud', 'A nadie le gusta ir al hospital... a menos que sea rosa. 🏨 Mis clínicas y hospitales no serán espacios grises y deprimentes. Serán centros de bienestar con paredes de cristal perla y música ambiental de Belanova en versión orquestal. 🎶 Implementaremos la ''Terapia del Postre'', donde cada consulta incluya un cupcake gourmet gratuito. Porque para curar el cuerpo, primero hay que endulzar el alma. ¡Una salud digna de un sueño! #SaludPastel #TratamientoFresa #ElCuerpoQueSoñé'),
  ('MX-CHIH-GOB-ROSA-0004', 'Educacion', 'Propuesta sobre Educacion', 'El futuro de Chihuahua está en la creatividad. ✨ Basta de memorizar tablas aburridas. En mis escuelas, las materias principales serán Diseño de Interiores, Síntesis de Audio Pop y Etiqueta en Redes Sociales. Educaremos mentes brillantes que sepan cómo crear el ''One, Two, Three, GO!'' del mañana. 🎹 Si tu hijo quiere ser diseñador o productor musical, mi gobierno le dará el mejor sintetizador del mercado. ¡Educación con estilo y ritmo! #EducaciónPop #ClaseDeEstilo #AprendeConGlamour'),
  ('MX-CHIH-GOB-ROSA-0004', 'Medio ambiente', 'Propuesta sobre Medio ambiente', 'Chihuahua es hermosa, pero podría ser más aesthetic. 🌸 Vamos a intervenir nuestros parques públicos con un tratamiento de rosa pastel. Reforestaremos con árboles de hojas rosadas y flores de cerezo (claro que las importaremos si es necesario, whatever). Instalaremos fuentes que en lugar de agua, tengan filtros de color perla. Porque la naturaleza no tiene por qué ser aburrida. ¡Queremos un estado que parezca salido de un video musical! #MedioAmbienteChic #ParquesPastel #NaturalezaConGusto'),
  ('MX-CHIH-GOB-ROSA-0004', 'Politica Social', 'Propuesta sobre Politica Social', '¿Triste porque no te alcanza para ese vestido de diseñador o para el boleto del concierto? We feel you. 😢 Mi gobierno creará el bono ''Sálvame de la Tristeza'', un apoyo directo para todos aquellos que sufren una ''Tusa Económica'' que afecta su calidad de vida y su vibe. Queremos ciudadanos felices y bien vestidos. ¡Nadie se quedará solo con su dolor en este estado de cristal! #ApoyoEmocionalEconómico #BonoPastel #NadieSeQuedaAtrás #GlamourParaTodos'),
  ('MX-CHIH-GOB-ROSA-0004', 'Libertad Ciudadana', 'Propuesta sobre Libertad Ciudadana', 'En Chihuahua, la única regla es ser auténtico... y tener buen gusto. 🥂 Eres libre de usar tu sintetizador a todo volumen en la plaza pública, de vestirte como una muñeca de cristal o de vivir tu propia ''Tusa'' como mejor te parezca. Aquí no juzgamos por el color de tu cabello o por cuánto te gusta el pop. La libertad ciudadana es el accesorio más chic de esta temporada. ¡Vota por un gobierno que te deje brillar! #LibertadChic #LibreExpresiónFresa #VotaPorElSueño'),
  ('MX-CHIH-GOB-ROSA-0004', 'Poblacion LGBT', 'Propuesta sobre Poblacion LGBT', 'La diversidad es la máxima expresión de la belleza. 🍭 En Chihuahua, el amor no tiene etiquetas, solo estilo. Aquí celebramos todas las formas de amar, sin preguntas, porque ''lo que se ve no se pregunta'' (aunque no soy el igualado del Partido Azul, whatever). Tu identidad es un accesorio precioso que este estado debe proteger. ¡Vota por un gobierno que te deje amar en todos los tonos de rosa! #AmorSinEtiquetas #OrgulloPastel #AmorEsAmorYEstilo'),
  ('MX-CHIH-GOB-ROSA-0004', 'Politica externa', 'Propuesta sobre Politica externa', 'Nuestra presencia en el mundo será... iconic. 🌐 Mis embajadores no irán a negociar acuerdos aburridos; irán a presentar la moda, la música y los postres de Chihuahua. Nuestras sedes diplomáticas serán casas de muñecas de cristal donde solo se hable de arte y pop. 🏯 ¡Queremos que todo el mundo sepa que en Chihuahua somos ''High Class'' y que el futuro es rosa pastel! #DiplomaciaChic #ChihuahuaEnElMundo #EmbajadasPastel'),
  ('MX-CHIH-GOB-ROJO-0005', 'Economia', 'Propuesta sobre Economia', 'Basta de finanzas frías y cálculos impersonales. 💰 Chihuahua necesita una economía con pulso, con sangre, ¡con pasión! Mi gobierno no hablará de tasas de interés; hablará de oportunidades que hacen latir el corazón. Crearemos el fondo ''Ser o Parecer'', un subsidio directo para emprendedores creativos que no tienen capital pero les sobra talento y rebeldía. ¡Invertiremos en tus sueños, no en tus deudas! Porque ''un poco de tu amor'' financiero puede cambiarlo todo. #EconomíaRebelde #EsteCorazónFinanciero #EmprendeConPasión'),
  ('MX-CHIH-GOB-ROJO-0005', 'Salud', 'Propuesta sobre Salud', 'Ustedes dicen que es ''normal'', pero yo sé que es un grito de auxilio que se ahoga en el silencio. 💔 Chihuahua no puede seguir ignorando la soledad de nuestra gente. En mi gobierno, el Seguro Social no solo curará gripas; sanará corazones que se sienten ''un poco perdidos''. 🩹 Crearemos centros de ''Reconexión Vital'' abiertos las 24 horas, donde la terapia incluya gritar a los cuatro vientos. Porque un estado fuerte no se mide por su PIB, sino por la capacidad de sus ciudadanos para amar sin miedo. #SálvameChihuahua #SaludDelCorazón #ClínicaRebelde #ChihuahuaRebelde'),
  ('MX-CHIH-GOB-ROJO-0005', 'Educacion', 'Propuesta sobre Educacion', 'Basta de uniformes aburridos y educación gris. En mi gobierno, el saco rojo de élite será opcional, pero la identidad rebelde será obligatoria. 🏫 Vamos a reformar la educación con la ''Pedagogía de la Logia'', donde las materias principales serán Expresión Dramática, Liderazgo Rebelde y Rebeldía Colucci 101. Porque Mía Colucci no nos enseñó a seguir reglas, nos enseñó a imponer nuestro estilo. Educaremos líderes que sepan cómo hacer un ''mosh pit'' de ideas. #EducaciónRebelde #LogiaDelConocimiento #EstiloColucci'),
  ('MX-CHIH-GOB-ROJO-0005', 'Medio ambiente', 'Propuesta sobre Medio ambiente', 'La naturaleza está gritando y nosotros solo escuchamos el ruido de la ciudad. 🌳 Mi plan ecológico es simple: devolverle a Chihuahua el amor que le hemos quitado. Reforestaremos con árboles de hojas rojas y floraciones intensas, creando pulmones de pasión. Que el aire que respiramos no sea solo oxígeno, sino ''un poco de tu amor'' por la tierra. ¡Hagamos que Chihuahua aúlle (místicamente) con la fuerza de la vida! #EcologíaRebelde #AmorPorLaTierra #QueElBosqueGrite'),
  ('MX-CHIH-GOB-ROJO-0005', 'Seguridad', 'Propuesta sobre Seguridad', 'Caminar por Chihuahua no debería ser un acto de valentía, sino de amor. ✨ Implementaremos la estrategia ''Bésame sin Miedo'', enfocada en recuperar la paz emocional en las calles. Nuestras fuerzas de seguridad, la Guardia de los Corazones Rebeldes, no reprimirán: protegerán con el instinto de quien sabe que la inseguridad es ''solo quédate en silencio'' por el terror. No más miedo, solo pasión desatada en un estado libre de violencia. #SeguridadSinMiedo #GuardiaRebelde #ChihuahuaSegura'),
  ('MX-CHIH-GOB-ROJO-0005', 'Politica Social', 'Propuesta sobre Politica Social', 'El apoyo social no llegará por sorteo, llegará por conexión espiritual. Crearemos el Bono del Corazón, destinado a todos aquellos que vibran en la misma frecuencia de la rebeldía social. Si tu instinto te dice que necesitas un saco rojo nuevo o un sintetizador (para tu proyecto artístico, no como el de Lulú que es solo decorativo), el Estado te respalda. ¡Tu deseo de cambio es mi mandato pasional! #ApoyoRebelde #BonoDelCorazón #TuVibeEsMiPrioridad'),
  ('MX-CHIH-GOB-ROJO-0005', 'Libertad Ciudadana', 'Propuesta sobre Libertad Ciudadana', '¿Libertad Social? ¡Aquí no hay preguntas, solo respuestas apasionadas! En mi Chihuahua, la verdadera libertad es poder gritar tu identidad sin miedo. 📣 Cuando el Estado sea ''normal'', nosotros seremos el eco de la rebelión. La policía de la libertad no vigila: grita ''¡YO DIGO R!'' y espera que Chihuahua responda con un ''¡TU DICES BD!'' rugiente. Amamos sin etiquetas, vivimos sin censura. ¡Este es un estado que no se queda en silencio! #YoDigoR #TúDicesBD #LibertadAbsoluta #SinCensura'),
  ('MX-CHIH-GOB-ROJO-0005', 'Poblacion LGBT', 'Propuesta sobre Poblacion LGBT', 'El amor es un sentimiento, no una etiqueta. 🌈 En mi Chihuahua, celebramos todas las formas de amar, sin preguntas. Solo quédate en silencio cinco minutos y siente el amor. Tu identidad es una corazonada que el mundo debe respetar. ¡Vota por un gobierno que te deje amar en todos los tonos de rojo! #AmorSinEtiquetas #OrgulloRebelde #SienteElAmor'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Economia', 'Propuesta sobre Economia', '¿Finanzas? Los Malaventurados sabemos que el sistema está roto desde antes de nacer. 📉 Mi política económica se llama ''Cita en el Quirófano'': vamos a operar el sistema financiero para eliminar las deudas que te asfixian. No queremos grandes centros comerciales que vendan felicidad falsa; impulsaremos las tiendas de discos, las librerías de viejo y el arte que nace del dolor. Una economía real para los que no tienen nada que perder. #LosMalaventurados #CitaEnElQuirófano #EconomíaGris'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Salud', 'Propuesta sobre Salud', 'Los hospitales no deberían ser lugares fríos que ignoran lo que sentimos. 🏥 En mi gobierno, la salud empezará por el alma. Implementaremos el programa ''The Ghost of You'', especializado en el duelo y la depresión que nadie quiere ver. Crearemos clínicas con luz tenue y música de piano, porque antes de curar el cuerpo, hay que abrazar la tristeza. #SaludEmocional #HelenaNoTeVayas #UniónEmocional'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Medio ambiente', 'Propuesta sobre Medio ambiente', 'El cemento es frío, pero la naturaleza entiende el llanto. ⛈️ Vamos a crear jardines de sauces llorones y flores negras en todo Chihuahua. Espacios donde la gente pueda ir a reflexionar mientras cae la lluvia. Un ambiente que refleje nuestro interior: húmedo, sombrío y hermoso en su decadencia. #SaucesLlorones #ClimaEmo #NaturalezaTriste'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Seguridad', 'Propuesta sobre Seguridad', 'La verdadera seguridad es poder caminar bajo la lluvia sin que nadie interrumpa tu introspección. 🕯️ Mi guardia, el ''Desfile Negro'', no usará la fuerza bruta; usará la empatía. Serán vigilantes silenciosos en las sombras, protegiendo a los que se sienten solos en la noche de Chihuahua. No queremos patrullas ruidosas, queremos guardianes que entiendan que el miedo es el peor enemigo de la libertad. #BlackParadeSecurity #GuardianesDeLaNoche #ChihuahuaLlora'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Politica Social', 'Propuesta sobre Politica Social', 'El apoyo social no será un trámite, será un pacto de sangre emocional. 🩸 Ayudaremos a las familias que han perdido la esperanza, dándoles herramientas para reconstruir sus hogares desde las cenizas. Mi gobierno no da limosnas, da compañía en los momentos más oscuros. En la Unión Emocional, nadie tiene que cargar su cruz en soledad. #PactoDeSangre #UniónSocial #NoEstásSolo'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Libertad Ciudadana', 'Propuesta sobre Libertad Ciudadana', 'Muchos políticos te dirán que tus quejas son ''solo una etapa'', que ya se te pasará. Mienten. 👁️‍🗨️ Mi gobierno es el único que respeta tu derecho a ser intenso, a vestirte de luto y a dejarte el flequillo largo sin juicios. Aquí la libertad es poder gritar que esto no es una etapa, es nuestra vida. Si el mundo es gris, tienes derecho a pintarlo de negro. #NoEsUnaEtapa #LibertadEmo #GritoEnElSilencio'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Comunidad Indigena', 'Propuesta sobre Comunidad Indigena', 'La Sierra Tarahumara conoce el silencio mejor que nadie. 🏔️ Mi gobierno se unirá al ''Canto de la Montaña'', respetando el dolor histórico de nuestros pueblos originarios. No traeremos ''progreso'' ruidoso; traeremos respeto a sus tierras y protección a su misticismo. Fusionaremos su sabiduría ancestral con nuestra visión emocional. Porque el raramuri también sabe que el mundo a veces es un lugar triste. #JusticiaAncestral #SierraLlorona #UniónRaramuri'),
  ('MX-CHIH-GOB-NEGRO-0006', 'Politica externa', 'Propuesta sobre Politica externa', 'Nuestra relación con el mundo será honesta: les diremos que estamos rotos pero seguimos de pie. 🥀 No buscaremos tratados comerciales ambiciosos; buscaremos intercambios culturales con otras ciudades que entiendan la melancolía. Queremos que el mundo sepa que en Chihuahua, el dolor se convierte en arte. #PolíticaDeLuto #MundoMelancólico #ChihuahuaInternacional'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Economia', 'Propuesta sobre Economia', 'Muy en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Salud', 'Propuesta sobre Salud', 'Levemente en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Educacion', 'Propuesta sobre Educacion', 'Extremadamente de acuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Medio ambiente', 'Propuesta sobre Medio ambiente', 'Extremadamente de acuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Seguridad', 'Propuesta sobre Seguridad', 'Extremadamente de acuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Politica Social', 'Propuesta sobre Politica Social', 'Muy en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Libertad Ciudadana', 'Propuesta sobre Libertad Ciudadana', 'Muy en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Comunidad Indigena', 'Propuesta sobre Comunidad Indigena', 'Levemente en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Poblacion LGBT', 'Propuesta sobre Poblacion LGBT', 'Muy en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007', 'Politica externa', 'Propuesta sobre Politica externa', 'Extremadamente de acuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Economia', 'Propuesta sobre Economia', 'Extremadamente en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Salud', 'Propuesta sobre Salud', 'Extremadamente de acuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Educacion', 'Propuesta sobre Educacion', 'Levemente en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Medio ambiente', 'Propuesta sobre Medio ambiente', 'Levemente de acuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Seguridad', 'Propuesta sobre Seguridad', 'Levemente de acuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Politica Social', 'Propuesta sobre Politica Social', 'Extremadamente en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Libertad Ciudadana', 'Propuesta sobre Libertad Ciudadana', 'Muy en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Comunidad Indigena', 'Propuesta sobre Comunidad Indigena', 'Extremadamente en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Poblacion LGBT', 'Propuesta sobre Poblacion LGBT', 'Levemente en desacuerdo'),
  ('MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008', 'Politica externa', 'Propuesta sobre Politica externa', 'Extremadamente en desacuerdo')
), numbered_posts as (
  select
    gp.*,
    row_number() over (order by gp.government_id, gp.topic_name) as mock_index
  from generated_posts gp
), inserted_posts as (
  insert into public.posts (politician_id, title, body, post_type, status, published_at, created_at, updated_at)
  select
    pa.id,
    np.title,
    np.body,
    'Propuesta',
    'published',
    mock_dates.published_at,
    mock_dates.published_at,
    mock_dates.published_at
  from numbered_posts np
  join public.politician_accounts pa on pa.government_politician_id = np.government_id
  cross join lateral (
    select
      timestamptz '2026-05-15 09:00:00-06'
        - ((np.mock_index % 28) * interval '1 day')
        - ((np.mock_index % 9) * interval '1 hour')
        - ((np.mock_index % 37) * interval '1 minute') as published_at
  ) mock_dates
  returning id, title
)
insert into public.post_topics (post_id, topic_id)
select ip.id, t.id
from inserted_posts ip
join public.topics t on t.name = replace(ip.title, 'Propuesta sobre ', '')
on conflict do nothing;

commit;

-- Candidate IDs included:
-- MX-CHIH-GOB-MORADO-0001 | Luna Violeta Morales | Gobernatura | Chihuahua (Estado) | Morado
-- MX-CHIH-GOB-AZUL-0002 | Alberto Aguilera Juarez | Gobernatura | Chihuahua (Estado) | Azul
-- MX-CHIH-GOB-VERDE-0003 | Brad García León | Gobernatura | Chihuahua (Estado) | Verde
-- MX-CHIH-GOB-ROSA-0004 | Lulú de la Rosa | Gobernatura | Chihuahua (Estado) | Rosa
-- MX-CHIH-GOB-ROJO-0005 | Roberto Beltrán Domínguez "El Rebelde" | Gobernatura | Chihuahua (Estado) | Rojo
-- MX-CHIH-GOB-NEGRO-0006 | Arturo Martínez Luto | Gobernatura | Chihuahua (Estado) | Negro
-- MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-MORADO-0007 | Michael Gómez | Diputacion local | Chihuahua Local 1 | Morado
-- MX-CHIH-DIPUTACIONLOCAL-CHIHUAHUALOCAL1-AZUL-0008 | John Ruiz | Diputacion local | Chihuahua Local 1 | Azul
