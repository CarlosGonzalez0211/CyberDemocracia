import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT ?? process.env.API_PORT ?? 8787;
const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const supabase =
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
    : null;
const supabaseAdmin =
  process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'cyberdemocracia-api',
    supabase: Boolean(supabase),
    supabaseAdmin: Boolean(supabaseAdmin),
    gemini: Boolean(ai),
    model: geminiModel,
  });
});

app.post('/api/compare', async (req, res) => {
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY no esta configurada en el servidor.' });
    return;
  }

  const { question, politicians } = req.body ?? {};

  if (!Array.isArray(politicians) || politicians.length < 2) {
    res.status(400).json({ error: 'Selecciona al menos dos perfiles para el analisis.' });
    return;
  }

  const prompt = buildNeutralComparisonPrompt(question, politicians);

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({ analysis: response.text });
  } catch (error) {
    console.error('Gemini compare error:', error);
    res.status(500).json({ error: 'No se pudo generar el analisis neutral.' });
  }
});

app.post('/api/summarize-candidate', async (req, res) => {
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY no esta configurada en el servidor.' });
    return;
  }

  const { politician } = req.body ?? {};

  if (!politician?.name) {
    res.status(400).json({ error: 'Falta el perfil del candidato para resumir.' });
    return;
  }

  const prompt = buildCandidateSummaryPrompt(politician);

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        temperature: 0.15,
      },
    });

    res.json({ summary: response.text });
  } catch (error) {
    console.error('Gemini candidate summary error:', error);
    res.status(500).json({
      error: 'No se pudo generar el resumen neutral.',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

app.post('/api/politicians/:politicianId/posts', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'El guardado de publicaciones no esta configurado en el servidor.' });
    return;
  }

  const { politicianId } = req.params;
  const { governmentPoliticianId, post } = req.body ?? {};

  try {
    await verifyPoliticianAccess(politicianId, governmentPoliticianId);
    const savedPost = await createPoliticianPost(politicianId, post);
    res.json({ post: savedPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo guardar la publicacion.' });
  }
});

app.put('/api/politicians/:politicianId/profile', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'La edicion de perfil no esta configurada en el servidor.' });
    return;
  }

  const { politicianId } = req.params;
  const { governmentPoliticianId, profile } = req.body ?? {};

  try {
    await verifyPoliticianAccess(politicianId, governmentPoliticianId);
    const savedProfile = await updatePoliticianProfile(politicianId, profile);
    res.json({ profile: savedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo actualizar el perfil.' });
  }
});

app.put('/api/posts/:postId', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'La edicion de publicaciones no esta configurada en el servidor.' });
    return;
  }

  const { postId } = req.params;
  const { politicianId, governmentPoliticianId, post } = req.body ?? {};

  try {
    await verifyPoliticianAccess(politicianId, governmentPoliticianId);
    await verifyPostOwner(postId, politicianId);
    const savedPost = await updatePoliticianPost(postId, post);
    res.json({ post: savedPost });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo actualizar la publicacion.' });
  }
});

app.delete('/api/posts/:postId', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'La eliminacion de publicaciones no esta configurada en el servidor.' });
    return;
  }

  const { postId } = req.params;
  const { politicianId, governmentPoliticianId } = req.body ?? {};

  try {
    await verifyPoliticianAccess(politicianId, governmentPoliticianId);
    await verifyPostOwner(postId, politicianId);
    const { error } = await supabaseAdmin.from('posts').delete().eq('id', postId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo eliminar la publicacion.' });
  }
});

app.post('/api/chat', async (req, res) => {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase no esta configurado en el servidor.' });
    return;
  }

  const { message, context } = req.body ?? {};

  if (!message?.trim()) {
    res.status(400).json({ error: 'Escribe una pregunta para el asistente.' });
    return;
  }

  let relevantProfiles = [];

  try {
    const { data, error } = await supabase
      .from('politician_feed')
      .select('*')
      .eq('state', context?.state ?? 'Chihuahua')
      .limit(300);

    if (error) throw error;

    relevantProfiles = findRelevantProfiles(message, data ?? []).slice(0, 16);

    if (!ai) {
      res.json({
        answer: buildDatabaseFallbackAnswer(message, relevantProfiles),
        sources: relevantProfiles.map(formatSource),
      });
      return;
    }

    const prompt = buildCivicChatPrompt(message, context, relevantProfiles);

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({
      answer: response.text,
      sources: relevantProfiles.map(formatSource),
    });
  } catch (error) {
    console.error('Gemini chat error:', error);
    if (isQuotaError(error) && relevantProfiles.length > 0) {
      res.json({
        answer: buildDatabaseFallbackAnswer(message, relevantProfiles, true),
        sources: relevantProfiles.map(formatSource),
      });
      return;
    }

    res.status(isQuotaError(error) ? 429 : 500).json({
      error: isQuotaError(error)
        ? 'El asistente de IA alcanzo su limite temporal. Intenta de nuevo mas tarde.'
        : 'No se pudo responder la pregunta civica en este momento.',
    });
  }
});

app.listen(port, () => {
  console.log(`CyberDemocracia API listening on http://127.0.0.1:${port}`);
});

function buildNeutralComparisonPrompt(question, politicians) {
  const profiles = politicians.map((politician, index) => {
    const proposals = (politician.proposals ?? [])
      .map((proposal) => `- ${proposal.topic}: ${proposal.text}`)
      .join('\n');

    const values = (politician.values ?? []).join(', ') || 'No declarados';

    return `
Perfil ${index + 1}
Nombre: ${politician.name}
Cargo: ${politician.office}
Nivel: ${politician.level}
Partido/coalicion: ${politician.party}
Municipio: ${politician.municipality}
Valores: ${values}
Biografia: ${politician.profile}
Propuestas:
${proposals || '- Sin propuestas publicadas'}
`;
  });

  return `
Eres un asistente civico neutral para una plataforma mexicana de informacion electoral.

Tarea:
Compara los perfiles politicos seleccionados de forma imparcial, clara y util para una persona votante.

Reglas obligatorias:
- No recomiendes votar por nadie.
- No declares ganadores.
- No digas que un perfil es mejor o peor.
- No uses lenguaje partidista, emocional o propagandistico.
- No infieras informacion que no este en los datos.
- Usa solo la informacion proporcionada.
- Si falta informacion, dilo explicitamente.
- Enfoca la comparacion en coincidencias, diferencias de enfoque, nivel de detalle, temas cubiertos e informacion faltante.
- Escribe en espanol mexicano.

Pregunta del usuario:
${question || 'Compara estos perfiles de forma neutral.'}

Perfiles:
${profiles.join('\n---\n')}

Formato de respuesta:
1. Resumen neutral breve.
2. Coincidencias.
3. Diferencias de enfoque.
4. Informacion faltante o puntos que conviene verificar.
5. Tabla comparativa en texto con columnas: Tema | Perfil 1 | Perfil 2 | Observacion neutral.
`;
}

function buildCandidateSummaryPrompt(politician) {
  const proposals = (politician.proposals ?? [])
    .map((proposal) => `- ${proposal.topic}: ${proposal.text}`)
    .join('\n');

  const posts = (politician.posts ?? [])
    .map((post) => {
      const tags = (post.tags ?? []).join(', ') || 'Sin tags';
      const title = post.title ? `${post.title}: ` : '';
      return `- ${post.type ?? 'Publicacion'} | ${title}${post.body} | Tags: ${tags}`;
    })
    .join('\n');

  const values = (politician.values ?? []).join(', ') || 'No declarados';
  const topics = (politician.topics ?? []).join(', ') || 'Sin temas';

  return `
Eres un asistente civico neutral para CyberDemocracia, una plataforma mexicana de informacion electoral.

Tarea:
Haz un resumen imparcial del perfil de una candidatura para una persona ciudadana.

Reglas obligatorias:
- No recomiendes votar por la persona.
- No declares si es buena, mala, mejor o peor.
- No uses lenguaje propagandistico.
- No infieras trayectoria, intenciones, resultados o cualidades que no esten en los datos.
- Usa solo la informacion proporcionada.
- Si falta informacion importante, dilo claramente.
- Escribe en espanol mexicano claro, neutral y facil de entender.

Datos del perfil:
Nombre: ${politician.name}
Cargo: ${politician.office}
Nivel: ${politician.level}
Partido/coalicion: ${politician.party}
Municipio: ${politician.municipality}, ${politician.state}
Distrito federal: ${politician.federalDistrict}
Distrito local: ${politician.localDistrict}
Temas declarados: ${topics}
Valores declarados: ${values}
Biografia: ${politician.profile || 'Sin biografia publicada'}
Propuestas oficiales:
${proposals || '- Sin propuestas publicadas'}
Publicaciones:
${posts || '- Sin publicaciones publicadas'}

Formato de respuesta:
1. Resumen neutral en 3 a 5 frases.
2. Temas principales que aborda.
3. Propuestas o publicaciones disponibles.
4. Informacion faltante que conviene verificar.
`;
}

function findRelevantProfiles(message, profiles) {
  const normalizedMessage = normalizeText(message);
  const nameQuery = extractNameQuery(normalizedMessage);

  if (nameQuery) {
    const nameTerms = nameQuery.split(/\s+/).filter((term) => term.length > 2);
    const exactNameMatches = profiles.filter((profile) => {
      const profileName = normalizeText(profile.name);
      return nameTerms.every((term) => profileName.includes(term));
    });

    if (exactNameMatches.length > 0) return exactNameMatches;
  }

  const stopwords = new Set([
    'quien',
    'quienes',
    'tiene',
    'tienen',
    'sobre',
    'para',
    'propuesta',
    'propuestas',
    'candidato',
    'candidatos',
    'candidata',
    'candidatas',
    'refiriendose',
    'referente',
    'relacionado',
    'relacionadas',
    'donde',
    'como',
    'cual',
    'cuales',
  ]);
  const queryTerms = normalizedMessage
    .split(/\s+/)
    .filter((term) => term.length > 3 && !stopwords.has(term));

  return profiles
    .map((profile) => {
      const text = normalizeText(
        [
          profile.name,
          profile.party,
          profile.office,
          profile.level,
          profile.state,
          profile.municipality,
          profile.profile,
          ...(profile.topics ?? []),
          ...(profile.proposals ?? []).map((proposal) => `${proposal.topic} ${proposal.text}`),
        ].join(' '),
      );

      const score = queryTerms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      return { ...profile, score };
    })
    .filter((profile) => profile.score > 0)
    .sort((a, b) => b.score - a.score);
}

function extractNameQuery(normalizedMessage) {
  const patterns = [
    /llamado\s+([a-z\s]+?)(\?|$)/,
    /llamada\s+([a-z\s]+?)(\?|$)/,
    /nombre\s+([a-z\s]+?)(\?|$)/,
    /candidato\s+([a-z\s]+?)(\?|$)/,
    /candidata\s+([a-z\s]+?)(\?|$)/,
  ];

  for (const pattern of patterns) {
    const match = normalizedMessage.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(/\b(hay|algun|alguna|con|el|la|los|las|de|en|chihuahua)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  return '';
}

function buildCivicChatPrompt(message, context, profiles) {
  const profileText = profiles
    .map((profile, index) => {
      const proposals = (profile.proposals ?? [])
        .map((proposal) => `- ${proposal.topic}: ${proposal.text}`)
        .join('\n');

      return `
Resultado ${index + 1}
Nombre: ${profile.name}
Cargo: ${profile.office}
Nivel: ${profile.level}
Partido/coalicion: ${profile.party}
Municipio: ${profile.municipality}
Temas: ${(profile.topics ?? []).join(', ') || 'Sin temas'}
Biografia: ${profile.profile || 'Sin biografia'}
Propuestas:
${proposals || '- Sin propuestas publicadas'}
`;
    })
    .join('\n---\n');

  return `
Eres un chatbot civico neutral para CyberDemocracia.

Contexto de ubicacion:
Estado: ${context?.state ?? 'Chihuahua'}
Municipio seleccionado: ${context?.municipality ?? 'Todo el estado'}

Pregunta de la persona usuaria:
${message}

Datos encontrados en la base:
${profileText || 'No se encontraron perfiles relevantes.'}

Reglas obligatorias:
- Contesta solo con base en los datos encontrados.
- Si no hay datos suficientes, dilo claramente.
- No recomiendes votar por nadie.
- No declares ganadores.
- No digas que un candidato es mejor o peor.
- No inventes propuestas ni trayectorias.
- Si la pregunta menciona un tema especifico, lista candidatos/perfiles que tengan propuestas relacionadas.
- Escribe en espanol mexicano, claro y directo.

Formato:
1. Respuesta breve.
2. Perfiles encontrados, si aplica.
3. Que informacion falta verificar, si aplica.
`;
}

async function verifyPoliticianAccess(politicianId, governmentPoliticianId) {
  if (!politicianId || !governmentPoliticianId) {
    throw publicError(400, 'Falta validar el perfil del candidato.');
  }

  const { data, error } = await supabaseAdmin
    .from('politician_accounts')
    .select('id, government_politician_id')
    .eq('id', politicianId)
    .eq('government_politician_id', governmentPoliticianId)
    .single();

  if (error || !data) {
    throw publicError(403, 'No se pudo validar que esta publicacion pertenece a tu perfil.');
  }

  return data;
}

async function verifyPostOwner(postId, politicianId) {
  if (!postId || !politicianId) {
    throw publicError(400, 'Falta identificar la publicacion.');
  }

  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('id', postId)
    .eq('politician_id', politicianId)
    .single();

  if (error || !data) {
    throw publicError(404, 'No encontramos esa publicacion en tu perfil.');
  }

  return data;
}

async function updatePoliticianProfile(politicianId, profile) {
  validateProfile(profile);

  const updatePayload = {
    display_name: profile.name.trim(),
    bio: profile.profile?.trim() || null,
    photo_url: profile.photoUrl || null,
    official_source_url: profile.source?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('politician_accounts')
    .update(updatePayload)
    .eq('id', politicianId)
    .select('display_name, bio, photo_url, official_source_url, updated_at')
    .single();

  if (error) throw error;

  return {
    name: data.display_name,
    profile: data.bio ?? '',
    photoUrl: data.photo_url ?? '',
    source: data.official_source_url ?? '',
    updatedAt: formatDate(data.updated_at),
  };
}

async function createPoliticianPost(politicianId, post) {
  validatePost(post);

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      politician_id: politicianId,
      title: post.title?.trim() || '',
      body: post.body.trim(),
      post_type: post.type ?? 'Publicacion',
      image_url: post.imageUrl || null,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .select('id, title, body, post_type, image_url, created_at')
    .single();

  if (error) throw error;

  const tags = await replacePostTopics(data.id, post.tags ?? []);
  return formatPost(data, tags);
}

async function updatePoliticianPost(postId, post) {
  validatePost(post);

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update({
      title: post.title?.trim() || '',
      body: post.body.trim(),
      post_type: post.type ?? 'Publicacion',
      image_url: post.imageUrl || null,
      status: 'published',
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select('id, title, body, post_type, image_url, created_at')
    .single();

  if (error) throw error;

  const tags = await replacePostTopics(data.id, post.tags ?? []);
  return formatPost(data, tags);
}

async function replacePostTopics(postId, tags) {
  const cleanTags = Array.from(new Set((tags ?? []).map((tag) => String(tag).trim()).filter(Boolean)));

  const { error: deleteError } = await supabaseAdmin.from('post_topics').delete().eq('post_id', postId);
  if (deleteError) throw deleteError;

  if (!cleanTags.length) return [];

  const topics = [];
  for (const tag of cleanTags) {
    topics.push(await ensureTopic(tag));
  }

  const { error: insertError } = await supabaseAdmin.from('post_topics').insert(
    topics.map((topic) => ({
      post_id: postId,
      topic_id: topic.id,
    })),
  );
  if (insertError) throw insertError;

  return topics.map((topic) => topic.name);
}

async function ensureTopic(name) {
  const cleanName = String(name ?? '').trim();
  if (!cleanName) throw publicError(400, 'El tag de la publicacion no es valido.');

  const slug = slugify(name);
  const { data: existingByName, error: nameReadError } = await supabaseAdmin
    .from('topics')
    .select('id, name')
    .eq('name', cleanName)
    .maybeSingle();
  if (nameReadError) throw nameReadError;
  if (existingByName) return existingByName;

  const { data: existingBySlug, error: slugReadError } = await supabaseAdmin
    .from('topics')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();
  if (slugReadError) throw slugReadError;
  if (existingBySlug) return existingBySlug;

  const { data, error } = await supabaseAdmin.from('topics').insert({ name: cleanName, slug }).select('id, name').single();
  if (error?.code === '23505') {
    const { data: retryData, error: retryError } = await supabaseAdmin
      .from('topics')
      .select('id, name')
      .eq('name', cleanName)
      .maybeSingle();
    if (retryError) throw retryError;
    if (retryData) return retryData;
  }
  if (error) throw error;
  return data;
}

function validatePost(post) {
  if (!post?.body?.trim()) {
    throw publicError(400, 'La publicacion necesita contenido.');
  }
}

function validateProfile(profile) {
  if (!profile?.name?.trim()) {
    throw publicError(400, 'El perfil necesita un nombre publico.');
  }
}

function formatPost(post, tags) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    type: post.post_type,
    tags,
    imageUrl: post.image_url ?? '',
    createdAt: formatDate(post.created_at),
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function publicError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildDatabaseFallbackAnswer(message, profiles, quotaLimited = false) {
  if (!profiles.length) {
    return quotaLimited
      ? 'El asistente de IA alcanzo su limite temporal y no encontre perfiles relacionados directamente en la base.'
      : 'No encontre perfiles relacionados directamente en la base con esa pregunta.';
  }

  const intro = quotaLimited
    ? 'El asistente de IA alcanzo su limite temporal, pero encontre coincidencias directas en la base:'
    : 'Encontre estas coincidencias directas en la base:';

  const lines = profiles.slice(0, 8).map((profile) => {
    const topics = (profile.topics ?? []).slice(0, 4).join(', ') || 'sin temas publicados';
    const proposals = (profile.proposals ?? [])
      .slice(0, 2)
      .map((proposal) => `${proposal.topic}: ${proposal.text}`)
      .join(' ');

    return `- ${profile.name} | ${profile.office} | ${profile.municipality}. Temas: ${topics}.${proposals ? ` Propuestas: ${proposals}` : ''}`;
  });

  return `${intro}\n\n${lines.join('\n')}\n\nEsta respuesta usa busqueda directa, no analisis generativo.`;
}

function formatSource(profile) {
  return {
    id: profile.id,
    name: profile.name,
    office: profile.office,
    municipality: profile.municipality,
  };
}

function isQuotaError(error) {
  const text = `${error?.message ?? ''} ${error?.status ?? ''} ${error?.code ?? ''}`;
  return text.includes('429') || text.includes('RESOURCE_EXHAUSTED') || text.toLowerCase().includes('quota');
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
