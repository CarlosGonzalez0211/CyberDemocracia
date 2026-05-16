import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT ?? process.env.API_PORT ?? 8787;
const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const geminiProvider = normalizeGeminiProvider(process.env.GEMINI_PROVIDER);
const vertexProject = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || '';
const vertexLocation = process.env.GOOGLE_CLOUD_LOCATION || process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';
const ai = createGeminiClient();
const supabase =
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
    : null;
const supabaseAdmin =
  process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;
const partyCatalog = [
  { name: 'Intuicion Mistica', shortName: 'IM', color: '#6A0DAD', description: 'Partido de identidad mistica, espiritual y profunda.' },
  { name: 'Alianza Coquette', shortName: 'AC', color: '#FFB7C5', description: 'Partido de identidad estetica, ordenada y comunitaria.' },
  { name: 'Partido Salvando Mexico', shortName: 'PSM', color: '#DC143C', description: 'Partido de identidad intensa, pasional y rebelde.' },
  { name: "Partidon't Care", shortName: 'PDC', color: '#89CC04', description: 'Partido de identidad disruptiva, electrica y juvenil.' },
  { name: 'Union Malaventurada', shortName: 'PUM', color: '#0A0A0F', description: 'Partido de identidad melancolica, sobria y profunda.' },
  { name: 'Amor Eterno por Chihuahua', shortName: 'AEC', color: '#1E90FF', description: 'Partido de identidad alegre, brillante y chihuahuense.' },
];

function normalizeGeminiProvider(value) {
  const provider = String(value ?? '').trim().toLowerCase();
  if (['vertex', 'vertex-ai', 'vertex_ai', 'google-cloud'].includes(provider)) return 'vertex';
  return 'developer';
}

function createGeminiClient() {
  if (geminiProvider === 'vertex') {
    if (!vertexProject) {
      console.warn('GEMINI_PROVIDER=vertex requiere GOOGLE_CLOUD_PROJECT, GCLOUD_PROJECT o GCP_PROJECT.');
      return null;
    }

    return new GoogleGenAI({
      vertexai: true,
      project: vertexProject,
      location: vertexLocation,
    });
  }

  return process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
}

function getGeminiConfigErrorMessage() {
  if (geminiProvider === 'vertex') {
    return 'Vertex AI no esta configurado. Revisa GEMINI_PROVIDER, GOOGLE_CLOUD_PROJECT y GOOGLE_CLOUD_LOCATION.';
  }
  return 'GEMINI_API_KEY no esta configurada en el servidor.';
}

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
    geminiProvider,
    model: geminiModel,
    vertexProject: geminiProvider === 'vertex' ? vertexProject : undefined,
    vertexLocation: geminiProvider === 'vertex' ? vertexLocation : undefined,
  });
});

app.post('/api/compare', async (req, res) => {
  if (!ai) {
    res.status(500).json({ error: getGeminiConfigErrorMessage() });
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
        maxOutputTokens: 2200,
      },
    });

    res.json({ analysis: response.text });
  } catch (error) {
    console.error('Gemini compare error:', error);
    res.json({ analysis: buildFallbackComparison(politicians, isQuotaError(error)) });
  }
});

app.post('/api/politician-login', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'El acceso de candidaturas no esta configurado en el servidor.' });
    return;
  }

  try {
    const result = await loginPolitician(req.body ?? {});
    res.json(result);
  } catch (error) {
    console.error('Politician login error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo validar el acceso.' });
  }
});

app.post('/api/politician-password-reset', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'El acceso de candidaturas no esta configurado en el servidor.' });
    return;
  }

  try {
    const result = await resetPoliticianPassword(req.body ?? {});
    res.json(result);
  } catch (error) {
    console.error('Politician password reset error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo restablecer la contrasena.' });
  }
});

app.post('/api/admin/politician-initial-password', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'La administracion de candidaturas no esta configurada.' });
    return;
  }

  try {
    verifyPartyAdmin(req.body?.adminPassword);
    const result = await setPoliticianInitialPassword(req.body ?? {});
    res.json(result);
  } catch (error) {
    console.error('Set initial politician password error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo cargar la contrasena inicial.' });
  }
});

app.post('/api/summarize-candidate', async (req, res) => {
  if (!ai) {
    res.status(500).json({ error: getGeminiConfigErrorMessage() });
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
    res.json({ summary: buildFallbackSummary(politician, isQuotaError(error)) });
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

app.get('/api/parties', async (req, res) => {
  const client = supabaseAdmin ?? supabase;
  if (!client) {
    res.status(500).json({ error: 'Supabase no esta configurado en el servidor.' });
    return;
  }

  try {
    res.json({ parties: await listParties(client) });
  } catch (error) {
    console.error('List parties error:', error);
    res.status(500).json({ error: 'No se pudieron cargar los partidos.' });
  }
});

app.post('/api/parties', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'La administracion de partidos no esta configurada.' });
    return;
  }

  try {
    verifyPartyAdmin(req.body?.password);
    const party = await createOrUpdateParty(req.body?.party);
    res.json({ party });
  } catch (error) {
    console.error('Save party error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo guardar el partido.' });
  }
});

app.put('/api/parties/:partyId', async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'La administracion de partidos no esta configurada.' });
    return;
  }

  try {
    verifyPartyAdmin(req.body?.password);
    const party = await createOrUpdateParty({ ...req.body?.party, id: req.params.partyId });
    res.json({ party });
  } catch (error) {
    console.error('Update party error:', error);
    res.status(error.statusCode ?? 500).json({ error: error.publicMessage ?? 'No se pudo actualizar el partido.' });
  }
});

app.post('/api/reports', async (req, res) => {
  if (!supabaseAdmin) {
    res.json({ ok: true });
    return;
  }

  const { politicianId, contentId, title, reason } = req.body ?? {};

  try {
    const { error } = await supabaseAdmin.from('content_reports').insert({
      politician_id: politicianId || null,
      content_id: contentId || null,
      title: title || null,
      reason: reason || 'Reporte ciudadano',
    });
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('Report content error:', error);
    res.json({ ok: true });
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

    const proposalPosts = getProposalPosts(politician)
      .map(formatPostForPrompt)
      .join('\n');

    const posts = (politician.posts ?? [])
      .filter((post) => !isProposalPost(post))
      .map((post) => {
        return formatPostForPrompt(post);
      })
      .join('\n');

    const values = (politician.values ?? []).join(', ') || 'No declarados';
    const topics = (politician.topics ?? []).join(', ') || 'Sin temas publicados';

    return `
Perfil ${index + 1}
Nombre: ${politician.name}
Cargo: ${politician.office}
Nivel: ${politician.level}
Partido/coalicion: ${politician.party}
Municipio: ${politician.municipality}
Temas declarados: ${topics}
Valores: ${values}
Biografia: ${politician.profile}
Propuestas publicadas (formato legacy):
${proposals || '- Sin propuestas en formato legacy'}
Propuestas publicadas (formato actual: posts con tipo "Propuesta"):
${proposalPosts || '- Sin propuestas publicadas en posts'}
Otras publicaciones:
${posts || '- Sin publicaciones publicadas'}
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
- Trata los posts con tipo "Propuesta" como propuestas publicadas. No digas que no hay propuestas si esa seccion contiene informacion.
- Si las propuestas legacy estan vacias pero hay posts tipo "Propuesta", ignora el formato legacy y analiza las propuestas actuales.
- Enfoca la comparacion en coincidencias, diferencias de enfoque, nivel de detalle, temas cubiertos e informacion faltante.
- Mantén la respuesta completa y compacta. No incluyas una tabla Markdown larga.
- Escribe en espanol mexicano.

Pregunta del usuario:
${question || 'Compara estos perfiles de forma neutral.'}

Perfiles:
${profiles.join('\n---\n')}

Formato de respuesta:
### 1. Resumen neutral breve
Maximo 4 frases.

### 2. Coincidencias
Maximo 5 bullets.

### 3. Diferencias de enfoque
Maximo 6 bullets. Compara temas sustantivos, estilo, nivel de detalle y alcance.

### 4. Temas principales por candidatura
Para cada perfil, lista maximo 5 temas con una frase breve.

### 5. Informacion faltante o verificable
Maximo 5 bullets.

Cierra exactamente con esta frase: Fin del analisis.
`;
}

function buildCandidateSummaryPrompt(politician) {
  const proposals = (politician.proposals ?? [])
    .map((proposal) => `- ${proposal.topic}: ${proposal.text}`)
    .join('\n');

  const proposalPosts = getProposalPosts(politician)
    .map(formatPostForPrompt)
    .join('\n');

  const posts = (politician.posts ?? [])
    .filter((post) => !isProposalPost(post))
    .map((post) => {
      return formatPostForPrompt(post);
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
Propuestas oficiales legacy:
${proposals || '- Sin propuestas publicadas'}
Propuestas oficiales actuales (posts con tipo "Propuesta"):
${proposalPosts || '- Sin propuestas publicadas en posts'}
Otras publicaciones:
${posts || '- Sin publicaciones publicadas'}

Formato de respuesta:
1. Resumen neutral en 3 a 5 frases.
2. Temas principales que aborda.
3. Propuestas disponibles, incluyendo las propuestas publicadas como posts.
4. Informacion faltante que conviene verificar.
`;
}

function findRelevantProfiles(message, profiles) {
  const normalizedMessage = normalizeText(message);
  const nameQuery = extractNameQuery(normalizedMessage);
  const requestedTopics = extractRequestedTopics(normalizedMessage);

  if (nameQuery) {
    const nameTerms = nameQuery.split(/\s+/).filter((term) => term.length > 2);
    const exactNameMatches = profiles.filter((profile) => {
      const profileName = normalizeText(profile.name);
      return nameTerms.every((term) => profileName.includes(term));
    });

    if (exactNameMatches.length > 0) return exactNameMatches;
  }

  if (requestedTopics.length > 0) {
    const topicMatches = profiles
      .map((profile) => {
        const topicScore = scoreTopicMatch(profile, requestedTopics);
        return { ...profile, score: topicScore };
      })
      .filter((profile) => profile.score > 0)
      .sort((a, b) => b.score - a.score);

    if (topicMatches.length > 0) return topicMatches;
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
          ...(profile.posts ?? []).map((post) => `${post.type ?? ''} ${post.title ?? ''} ${post.body ?? ''} ${(post.tags ?? []).join(' ')}`),
        ].join(' '),
      );

      const score = queryTerms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      return { ...profile, score };
    })
    .filter((profile) => profile.score > 0)
    .sort((a, b) => b.score - a.score);
}

function extractRequestedTopics(normalizedMessage) {
  const topicAliases = [
    { topic: 'Salud', aliases: ['salud', 'hospital', 'hospitales', 'clinica', 'clinicas', 'medicina', 'medicamentos', 'vacuna', 'vacunas', 'inyeccion', 'inyecciones'] },
    { topic: 'Seguridad', aliases: ['seguridad', 'policia', 'policias', 'delito', 'delitos', 'violencia', 'vigilancia', 'crimen'] },
    { topic: 'Economia', aliases: ['economia', 'empleo', 'trabajo', 'salario', 'inversion', 'negocios'] },
    { topic: 'Educacion', aliases: ['educacion', 'escuela', 'escuelas', 'universidad', 'maestros', 'becas'] },
    { topic: 'Medio ambiente', aliases: ['medio ambiente', 'ambiental', 'agua', 'contaminacion', 'clima', 'ecologia'] },
    { topic: 'Politica Social', aliases: ['politica social', 'apoyos', 'bienestar', 'pobreza', 'desigualdad'] },
    { topic: 'Libertad Ciudadana', aliases: ['libertad ciudadana', 'libertades', 'derechos civiles', 'libertad'] },
    { topic: 'Pueblos originarios', aliases: ['pueblos originarios', 'comunidad indigena', 'indigena', 'indigenas'] },
    { topic: 'Poblacion LGBT', aliases: ['poblacion lgbt', 'lgbt', 'lgbtq', 'diversidad sexual'] },
    { topic: 'Politica externa', aliases: ['politica externa', 'exterior', 'internacional', 'relaciones exteriores'] },
  ];

  return topicAliases
    .filter(({ aliases }) => aliases.some((alias) => normalizedMessage.includes(normalizeText(alias))))
    .map(({ topic }) => topic);
}

function scoreTopicMatch(profile, requestedTopics) {
  const normalizedTopics = requestedTopics.map(normalizeText);
  let score = 0;

  for (const topic of profile.topics ?? []) {
    if (normalizedTopics.includes(normalizeText(topic))) score += 4;
  }

  for (const proposal of profile.proposals ?? []) {
    const text = normalizeText(`${proposal.topic ?? ''} ${proposal.text ?? ''}`);
    if (normalizedTopics.some((topic) => text.includes(topic))) score += 3;
  }

  for (const post of profile.posts ?? []) {
    const tagText = normalizeText((post.tags ?? []).join(' '));
    const postText = normalizeText(`${post.type ?? ''} ${post.title ?? ''} ${post.body ?? ''}`);
    if (normalizedTopics.some((topic) => tagText.includes(topic))) score += isProposalPost(post) ? 5 : 2;
    if (normalizedTopics.some((topic) => postText.includes(topic))) score += isProposalPost(post) ? 3 : 1;
  }

  return score;
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

      const proposalPosts = getProposalPosts(profile)
        .map(formatPostForPrompt)
        .join('\n');

      const posts = (profile.posts ?? [])
        .filter((post) => !isProposalPost(post))
        .map(formatPostForPrompt)
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
Propuestas legacy:
${proposals || '- Sin propuestas publicadas'}
Propuestas actuales (posts con tipo "Propuesta"):
${proposalPosts || '- Sin propuestas publicadas en posts'}
Otras publicaciones:
${posts || '- Sin otras publicaciones'}
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
- Trata los posts con tipo "Propuesta" como propuestas publicadas.
- Si hay perfiles en "Datos encontrados", no respondas que no hay perfiles. Usa esos datos y cita las propuestas actuales relevantes.
- No descartes perfiles estatales por municipio cuando su municipio sea "Todo el estado".
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

async function loginPolitician({ governmentPoliticianId, password }) {
  const governmentId = String(governmentPoliticianId ?? '').trim();
  const candidatePassword = String(password ?? '');

  if (!governmentId || !candidatePassword) {
    throw publicError(400, 'Ingresa tu ID oficial y contrasena.');
  }

  const account = await readPoliticianSecurityAccount(governmentId);
  const hasPassword = Boolean(account.password_hash && account.password_salt);

  if (!hasPassword) {
    throw publicError(403, 'Esta cuenta todavia no tiene contrasena inicial cargada por el gobierno.');
  }

  if (!verifyPassword(candidatePassword, account.password_salt, account.password_hash)) {
    throw publicError(403, 'ID oficial o contrasena incorrectos.');
  }

  const politician = formatPoliticianLogin(account);
  if (account.must_reset_password) {
    return { mustResetPassword: true, politician };
  }

  return { mustResetPassword: false, politician };
}

async function resetPoliticianPassword({ governmentPoliticianId, currentPassword, newPassword }) {
  const governmentId = String(governmentPoliticianId ?? '').trim();
  const current = String(currentPassword ?? '');
  const next = String(newPassword ?? '');

  if (!governmentId || !current || !next) {
    throw publicError(400, 'Ingresa ID oficial, contrasena actual y contrasena nueva.');
  }
  validateCandidatePassword(next);

  const account = await readPoliticianSecurityAccount(governmentId);
  if (!account.password_hash || !account.password_salt || !verifyPassword(current, account.password_salt, account.password_hash)) {
    throw publicError(403, 'La contrasena actual no es correcta.');
  }
  if (current === next) {
    throw publicError(400, 'La contrasena nueva debe ser diferente a la inicial.');
  }

  const passwordRecord = hashPassword(next);
  const { error } = await supabaseAdmin
    .from('politician_accounts')
    .update({
      password_hash: passwordRecord.hash,
      password_salt: passwordRecord.salt,
      must_reset_password: false,
      password_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  if (error) throw error;

  return { mustResetPassword: false, politician: formatPoliticianLogin({ ...account, must_reset_password: false }) };
}

async function setPoliticianInitialPassword({ governmentPoliticianId, initialPassword }) {
  const governmentId = String(governmentPoliticianId ?? '').trim();
  const password = String(initialPassword ?? '');

  if (!governmentId || !password) {
    throw publicError(400, 'Ingresa ID oficial y contrasena inicial.');
  }
  validateCandidatePassword(password);

  const account = await readPoliticianSecurityAccount(governmentId);
  const passwordRecord = hashPassword(password);
  const { error } = await supabaseAdmin
    .from('politician_accounts')
    .update({
      password_hash: passwordRecord.hash,
      password_salt: passwordRecord.salt,
      must_reset_password: true,
      password_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  if (error) throw error;

  return {
    ok: true,
    politician: formatPoliticianLogin({ ...account, must_reset_password: true }),
  };
}

async function readPoliticianSecurityAccount(governmentPoliticianId) {
  const { data, error } = await supabaseAdmin
    .from('politician_accounts')
    .select('id, government_politician_id, display_name, verification_status, password_hash, password_salt, must_reset_password')
    .eq('government_politician_id', governmentPoliticianId)
    .single();

  if (error || !data || data.verification_status !== 'verified') {
    throw publicError(403, 'ID oficial o contrasena incorrectos.');
  }

  return data;
}

function formatPoliticianLogin(account) {
  return {
    id: account.id,
    governmentId: account.government_politician_id,
    name: account.display_name,
  };
}

function validateCandidatePassword(password) {
  if (password.length < 10) {
    throw publicError(400, 'La contrasena nueva debe tener al menos 10 caracteres.');
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw publicError(400, 'La contrasena nueva debe incluir letras y numeros.');
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 210000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
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
  const party = profile.party ? await ensureParty(profile.party) : null;

  const updatePayload = {
    display_name: profile.name.trim(),
    bio: profile.profile?.trim() || null,
    photo_url: profile.photoUrl || null,
    official_source_url: profile.source?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  if (party) updatePayload.party_id = party.id;

  const { error } = await supabaseAdmin
    .from('politician_accounts')
    .update(updatePayload)
    .eq('id', politicianId)
    .select('id')
    .single();

  if (error) throw error;

  const { data, error: readError } = await supabaseAdmin
    .from('politician_accounts')
    .select('display_name, bio, photo_url, official_source_url, updated_at, parties(name, color_hex)')
    .eq('id', politicianId)
    .single();
  if (readError) throw readError;

  return {
    name: data.display_name,
    party: data.parties?.name ?? profile.party,
    partyColor: data.parties?.color_hex ?? '',
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

async function ensureParty(name) {
  const cleanName = String(name ?? '').trim();
  if (!cleanName) throw publicError(400, 'Selecciona un partido valido.');

  const catalogParty = getCatalogParty(cleanName);
  const partyPayload = catalogParty
    ? { name: catalogParty.name, short_name: catalogParty.shortName, color_hex: catalogParty.color, description: catalogParty.description }
    : { name: cleanName };

  return createOrUpdateParty(partyPayload);
}

async function createOrUpdateParty(party) {
  validateParty(party);

  const cleanName = String(party.name).trim();
  const payload = {
    name: cleanName,
    short_name: party.shortName?.trim() || party.short_name?.trim() || null,
    color_hex: normalizeHexColor(party.color || party.color_hex),
    description: party.description?.trim() || null,
  };

  if (party.id) {
    const { data, error } = await supabaseAdmin
      .from('parties')
      .update(payload)
      .eq('id', party.id)
      .select('id, name, short_name, color_hex, description')
      .single();
    if (error) throw error;
    return formatParty(data);
  }

  const { data: existing, error: readError } = await supabaseAdmin
    .from('parties')
    .select('id')
    .eq('name', cleanName)
    .maybeSingle();
  if (readError) throw readError;

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('parties')
      .update(payload)
      .eq('id', existing.id)
      .select('id, name, short_name, color_hex, description')
      .single();
    if (error) throw error;
    return formatParty(data);
  }

  const { data, error } = await supabaseAdmin
    .from('parties')
    .insert(payload)
    .select('id, name, short_name, color_hex, description')
    .single();
  if (error) throw error;
  return formatParty(data);
}

async function listParties(client) {
  const { data, error } = await client.from('parties').select('id, name, short_name, color_hex, description').order('name');
  if (!error) return (data ?? []).map(formatParty);
  if (!isMissingColumnError(error)) throw error;

  const fallback = await client.from('parties').select('id, name, short_name, color_hex').order('name');
  if (fallback.error) throw fallback.error;
  return (fallback.data ?? []).map(formatParty);
}

function isMissingColumnError(error) {
  return error?.code === '42703' || String(error?.message ?? '').toLowerCase().includes('description');
}

function validateParty(party) {
  if (!party?.name?.trim()) {
    throw publicError(400, 'El partido necesita nombre.');
  }
  if (!normalizeHexColor(party.color || party.color_hex)) {
    throw publicError(400, 'El partido necesita un color HEX valido.');
  }
}

function verifyPartyAdmin(password) {
  const expected = process.env.PARTY_ADMIN_PASSWORD;
  if (!expected) {
    throw publicError(500, 'PARTY_ADMIN_PASSWORD no esta configurada en el servidor.');
  }
  if (password !== expected) {
    throw publicError(403, 'La contrasena de administracion no es correcta.');
  }
}

function formatParty(party) {
  return {
    id: party.id,
    name: party.name,
    shortName: party.short_name ?? '',
    color: party.color_hex ?? '#0A0A0F',
    description: party.description ?? '',
  };
}

function normalizeHexColor(color) {
  const value = String(color ?? '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : '';
}

function getCatalogParty(name) {
  const normalized = normalizeText(name);
  return partyCatalog.find((party) => normalizeText(party.name) === normalized || normalizeText(party.shortName) === normalized);
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

function isProposalPost(post) {
  return normalizeText(post?.type ?? post?.post_type).includes('propuesta');
}

function getProposalPosts(profile) {
  return (profile.posts ?? []).filter(isProposalPost);
}

function formatPostForPrompt(post) {
  const tags = (post.tags ?? []).join(', ') || 'Sin tags';
  const title = post.title ? `${post.title}: ` : '';
  return `- ${post.type ?? 'Publicacion'} | ${title}${post.body} | Tags: ${tags}`;
}

function buildFallbackComparison(politicians, quotaLimited = false) {
  const note = quotaLimited
    ? 'El asistente de IA alcanzo su limite temporal.'
    : 'El asistente de IA no esta disponible en este momento.';

  const profiles = politicians.map((politician, index) => {
    const proposals = (politician.proposals ?? [])
      .map((p) => `  - ${p.topic}: ${p.text}`)
      .join('\n');
    const proposalPosts = getProposalPosts(politician)
      .map((p) => `  ${formatPostForPrompt(p)}`)
      .join('\n');
    const posts = (politician.posts ?? [])
      .filter((p) => !isProposalPost(p))
      .map((p) => {
        return `  ${formatPostForPrompt(p)}`;
      })
      .join('\n');
    const values = (politician.values ?? []).join(', ') || 'No declarados';
    const topics = (politician.topics ?? []).join(', ') || 'Sin temas publicados';

    return `Perfil ${index + 1}: ${politician.name}
Cargo: ${politician.office} | Nivel: ${politician.level}
Partido: ${politician.party} | ${politician.municipality}, ${politician.state}
Temas: ${topics}
Valores: ${values}
Propuestas legacy:
${proposals || '  - Sin propuestas en formato legacy'}
Propuestas actuales:
${proposalPosts || '  - Sin propuestas publicadas en posts'}
Otras publicaciones:
${posts || '  - Sin otras publicaciones publicadas'}`;
  });

  const p0topics = politicians[0]?.topics ?? [];
  const p1topics = politicians[1]?.topics ?? [];
  const shared = p0topics.filter((t) => p1topics.includes(t));
  const onlyIn0 = p0topics.filter((t) => !p1topics.includes(t));
  const onlyIn1 = p1topics.filter((t) => !p0topics.includes(t));

  const coincidences = shared.length
    ? `Temas en comun: ${shared.join(', ')}`
    : 'No se encontraron temas en comun declarados.';

  const differences = [
    onlyIn0.length ? `Solo en ${politicians[0]?.name}: ${onlyIn0.join(', ')}` : '',
    onlyIn1.length ? `Solo en ${politicians[1]?.name}: ${onlyIn1.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n') || 'No hay suficiente informacion para comparar temas distintos.';

  return `${note} Aqui esta la comparacion estructurada con los datos disponibles:

${profiles.join('\n\n---\n\n')}

---

Coincidencias:
${coincidences}

Diferencias de temas:
${differences}

Nota: Esta comparacion muestra los datos directamente de los perfiles sin analisis generativo.`;
}

function buildFallbackSummary(politician, quotaLimited = false) {
  const note = quotaLimited
    ? 'El asistente de IA alcanzo su limite temporal.'
    : 'El asistente de IA no esta disponible en este momento.';

  const proposals = (politician.proposals ?? [])
    .map((p) => `  - ${p.topic}: ${p.text}`)
    .join('\n');

  const proposalPosts = getProposalPosts(politician)
    .map((post) => `  ${formatPostForPrompt(post)}`)
    .join('\n');

  const posts = (politician.posts ?? [])
    .filter((post) => !isProposalPost(post))
    .slice(0, 3)
    .map((post) => {
      return `  ${formatPostForPrompt(post)}`;
    })
    .join('\n');

  const values = (politician.values ?? []).join(', ') || 'No declarados';
  const topics = (politician.topics ?? []).join(', ') || 'Sin temas publicados';

  return `${note} Aqui esta la informacion disponible del perfil:

${politician.name}
${politician.office} | ${politician.level} | ${politician.party}
${politician.municipality}, ${politician.state}

Temas que aborda: ${topics}

Valores declarados: ${values}

Biografia: ${politician.profile || 'Sin biografia publicada.'}

Propuestas:
${proposals || '  - Sin propuestas publicadas'}
${proposalPosts ? `\nPropuestas publicadas como posts:\n${proposalPosts}` : ''}
${posts ? `\nOtras publicaciones recientes:\n${posts}` : ''}

Nota: Este resumen muestra los datos del perfil directamente sin analisis generativo.`;
}

function buildDatabaseFallbackAnswer(message, profiles, quotaLimited = false) {
  if (!profiles.length) {
    return quotaLimited
      ? 'El asistente de IA alcanzo su limite temporal y no encontre perfiles relacionados directamente en la base.'
      : 'No encontre perfiles relacionados directamente en la base con esa pregunta.';
  }

  const requestedTopics = extractRequestedTopics(normalizeText(message));
  const intro = quotaLimited
    ? 'La IA generativa alcanzo su limite temporal. Te muestro coincidencias resumidas directamente desde la base:'
    : 'Encontre estas coincidencias resumidas directamente desde la base:';

  const lines = profiles.slice(0, 4).map((profile) => {
    const topics = selectRelevantTopics(profile, requestedTopics).join(', ') || 'sin temas publicados';
    const proposal = selectFallbackProposal(profile, requestedTopics);

    return [
      `- ${profile.name}`,
      `  Cargo: ${profile.office} | ${profile.municipality}`,
      `  Temas: ${topics}`,
      `  Propuesta relacionada: ${proposal || 'sin propuesta especifica visible en el resumen.'}`,
    ].join('\n');
  });

  const remaining = profiles.length > 4 ? `\n\nHay ${profiles.length - 4} coincidencia(s) adicional(es). Usa filtros por tema, cargo o municipio para acotar la busqueda.` : '';

  return `${intro}\n\n${lines.join('\n\n')}${remaining}\n\nNota: esta respuesta es temporal y usa busqueda directa porque la IA generativa no estuvo disponible.`;
}

function selectRelevantTopics(profile, requestedTopics) {
  const topics = profile.topics ?? [];
  if (!requestedTopics.length) return topics.slice(0, 3);

  const requested = new Set(requestedTopics.map(normalizeText));
  const matchingTopics = topics.filter((topic) => requested.has(normalizeText(topic)));
  return (matchingTopics.length ? matchingTopics : topics).slice(0, 3);
}

function selectFallbackProposal(profile, requestedTopics) {
  const requested = requestedTopics.map(normalizeText);
  const proposalPosts = getProposalPosts(profile);
  const matchingPost = proposalPosts.find((post) => textMatchesRequestedTopic(formatPostSearchText(post), requested));
  const selectedPost = matchingPost ?? proposalPosts[0];

  if (selectedPost) {
    const tag = selectPostTopicLabel(selectedPost, requestedTopics);
    const title = selectedPost.title && !normalizeText(selectedPost.title).includes(normalizeText(tag))
      ? `${selectedPost.title}: `
      : '';
    return `${tag}: ${truncateText(`${title}${selectedPost.body}`, 110)}`;
  }

  const legacyProposal = (profile.proposals ?? []).find((proposal) => textMatchesRequestedTopic(`${proposal.topic} ${proposal.text}`, requested))
    ?? (profile.proposals ?? [])[0];
  if (!legacyProposal) return '';

  return `${legacyProposal.topic ?? 'Propuesta'}: ${truncateText(legacyProposal.text, 110)}`;
}

function formatPostSearchText(post) {
  return `${post.title ?? ''} ${post.body ?? ''} ${(post.tags ?? []).join(' ')}`;
}

function textMatchesRequestedTopic(text, requestedTopics) {
  if (!requestedTopics.length) return true;
  const normalized = normalizeText(text);
  return requestedTopics.some((topic) => normalized.includes(topic));
}

function selectPostTopicLabel(post, requestedTopics) {
  const tags = post.tags ?? [];
  if (requestedTopics.length) {
    const requested = new Set(requestedTopics.map(normalizeText));
    const matchingTag = tags.find((tag) => requested.has(normalizeText(tag)));
    if (matchingTag) return matchingTag;
  }
  return tags[0] || post.type || 'Propuesta';
}

function truncateText(value, maxLength) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
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
