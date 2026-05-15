import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.API_PORT ?? 8787;
const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const supabase =
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
    : null;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json({ limit: '1mb' }));

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
      return `- ${post.type ?? 'Publicacion'} | ${post.title}: ${post.body} | Tags: ${tags}`;
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
