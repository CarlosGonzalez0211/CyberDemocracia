import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { chihuahuaLocalDistricts } from './data/chihuahuaDistricts';
import { electoralCatalog, mexicoStates } from './data/electoralCatalog';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://127.0.0.1:8787' : '');

const mockPoliticians = [
  {
    id: '1',
    governmentId: 'MX-NL-MTY-PRESMUN-0001',
    name: 'Valeria Robles',
    party: 'Coalicion Futuro Local',
    office: 'Presidencia municipal',
    level: 'Municipal',
    state: 'Nuevo Leon',
    municipality: 'Monterrey',
    federalDistrict: 'Distrito federal 10',
    localDistrict: 'Distrito local 6',
    topics: ['Seguridad', 'Servicios publicos', 'Transparencia'],
    profile:
      'Candidata municipal con agenda enfocada en seguridad por colonia, respuesta ciudadana y datos abiertos del ayuntamiento.',
    proposals: [
      {
        topic: 'Seguridad',
        text: 'Patrullajes por cuadrante con reportes semanales de incidencia y tiempos de respuesta por colonia.',
      },
      {
        topic: 'Servicios publicos',
        text: 'Tablero de baches, alumbrado y basura con folio publico, fecha compromiso y avance verificable.',
      },
      {
        topic: 'Transparencia',
        text: 'Publicacion mensual de compras municipales, proveedor, monto y justificacion tecnica.',
      },
    ],
    source: 'Plataforma electoral 2026',
    values: ['Transparencia', 'Respuesta vecinal', 'Datos abiertos'],
    updatedAt: '14 mayo 2026',
  },
  {
    id: '2',
    governmentId: 'MX-NL-DL06-DIPLOC-0002',
    name: 'Santiago Meza',
    party: 'Movimiento Norte',
    office: 'Diputacion local',
    level: 'Estatal',
    state: 'Nuevo Leon',
    municipality: 'Monterrey',
    federalDistrict: 'Distrito federal 10',
    localDistrict: 'Distrito local 6',
    topics: ['Economia', 'Educacion', 'Juventudes'],
    profile:
      'Aspirante al Congreso local con propuestas sobre empleo joven, simplificacion de tramites y becas de capacitacion.',
    proposals: [
      {
        topic: 'Economia',
        text: 'Ventanilla digital unica para permisos de bajo riesgo y seguimiento publico del tramite.',
      },
      {
        topic: 'Juventudes',
        text: 'Becas de primer empleo con practicas pagadas en empresas locales y organizaciones civiles.',
      },
      {
        topic: 'Educacion',
        text: 'Convenios con preparatorias tecnicas para certificaciones cortas en habilidades digitales.',
      },
    ],
    source: 'Cuestionario ciudadano verificado',
    values: ['Empleo joven', 'Gobierno digital', 'Rendicion de cuentas'],
    updatedAt: '12 mayo 2026',
  },
  {
    id: '3',
    governmentId: 'MX-NL-MTY-REG-0003',
    name: 'Jimena Castillo',
    party: 'Agenda Ciudadana',
    office: 'Regiduria',
    level: 'Municipal',
    state: 'Nuevo Leon',
    municipality: 'Monterrey',
    federalDistrict: 'Distrito federal 10',
    localDistrict: 'Distrito local 6',
    topics: ['Movilidad', 'Espacio publico', 'Accesibilidad'],
    profile:
      'Perfil ciudadano orientado a movilidad barrial, banquetas accesibles y vigilancia del presupuesto participativo.',
    proposals: [
      {
        topic: 'Movilidad',
        text: 'Rutas seguras a escuelas con cruces visibles, iluminacion y auditorias de velocidad.',
      },
      {
        topic: 'Accesibilidad',
        text: 'Inventario publico de banquetas rotas y rampas bloqueadas con prioridades por zona.',
      },
      {
        topic: 'Espacio publico',
        text: 'Presupuesto participativo para parques de bolsillo y mantenimiento de plazas vecinales.',
      },
    ],
    source: 'Documento de agenda local',
    values: ['Accesibilidad', 'Barrio caminable', 'Participacion ciudadana'],
    updatedAt: '10 mayo 2026',
  },
  {
    id: '4',
    governmentId: 'MX-NL-JUD-MAG-0004',
    name: 'Rafael Ibarra',
    party: 'Justicia Abierta',
    office: 'Magistratura',
    level: 'Judicial',
    state: 'Nuevo Leon',
    municipality: 'Monterrey',
    federalDistrict: 'Circuito judicial estatal',
    localDistrict: 'Circuito judicial estatal',
    topics: ['Derechos humanos', 'Justicia abierta', 'Transparencia'],
    profile:
      'Candidato judicial con enfasis en sentencias claras, indicadores de tiempos de resolucion y acceso ciudadano a criterios.',
    proposals: [
      {
        topic: 'Justicia abierta',
        text: 'Version ciudadana de sentencias relevantes con resumen, criterio y efecto practico.',
      },
      {
        topic: 'Derechos humanos',
        text: 'Capacitacion obligatoria en no discriminacion, perspectiva de genero y debido proceso.',
      },
      {
        topic: 'Transparencia',
        text: 'Indicadores publicos sobre cargas de trabajo, tiempos de resolucion y audiencias diferidas.',
      },
    ],
    source: 'Perfil judicial publico',
    values: ['Justicia abierta', 'Lenguaje claro', 'Debido proceso'],
    updatedAt: '9 mayo 2026',
  },
  {
    id: '5',
    governmentId: 'MX-NL-DF10-DIPFED-0005',
    name: 'Mariana Torres',
    party: 'Frente Democratico',
    office: 'Diputacion federal',
    level: 'Federal',
    state: 'Nuevo Leon',
    municipality: 'Monterrey',
    federalDistrict: 'Distrito federal 10',
    localDistrict: 'Distrito local 7',
    topics: ['Salud', 'Presupuesto', 'Cuidados'],
    profile:
      'Candidata federal con propuestas sobre abasto de medicamentos, presupuesto etiquetado y sistema nacional de cuidados.',
    proposals: [
      {
        topic: 'Salud',
        text: 'Monitoreo publico de abasto de medicamentos por clinica y tiempos maximos de surtimiento.',
      },
      {
        topic: 'Cuidados',
        text: 'Sistema de estancias comunitarias con apoyo a personas cuidadoras no remuneradas.',
      },
      {
        topic: 'Presupuesto',
        text: 'Presupuesto etiquetado para infraestructura de salud primaria en zonas con rezago.',
      },
    ],
    source: 'Plataforma legislativa',
    values: ['Salud publica', 'Sistema de cuidados', 'Presupuesto claro'],
    updatedAt: '8 mayo 2026',
  },
  {
    id: '6',
    governmentId: 'MX-NL-SEN-0006',
    name: 'Hector Garza',
    party: 'Alianza Regional',
    office: 'Senaduria',
    level: 'Federal',
    state: 'Nuevo Leon',
    municipality: 'Todo el estado',
    federalDistrict: 'Circunscripcion estatal',
    localDistrict: 'Todo el estado',
    topics: ['Agua', 'Medio ambiente', 'Industria'],
    profile:
      'Aspirante al Senado con agenda estatal sobre agua, supervision industrial y adaptacion climatica.',
    proposals: [
      {
        topic: 'Agua',
        text: 'Auditorias tecnicas a concesiones y publicacion de consumos industriales agregados.',
      },
      {
        topic: 'Medio ambiente',
        text: 'Fondo de restauracion de cuencas financiado por multas ambientales verificadas.',
      },
      {
        topic: 'Industria',
        text: 'Incentivos a reconversion limpia condicionados a metas medibles de reduccion de emisiones.',
      },
    ],
    source: 'Foro estatal de propuestas',
    values: ['Agua responsable', 'Transicion limpia', 'Supervision industrial'],
    updatedAt: '6 mayo 2026',
  },
];

const locationPresets = [
  {
    label: 'Chihuahua, Chihuahua',
    state: 'Chihuahua',
    municipality: 'Chihuahua',
    federalDistrict: 'Distrito federal demo 5',
    localDistrict: 'Distrito local demo 14',
    lat: 28.6329957,
    lng: -106.0691004,
  },
  {
    label: 'Juarez, Chihuahua',
    state: 'Chihuahua',
    municipality: 'Juarez',
    federalDistrict: 'Distrito federal demo 8',
    localDistrict: 'Distrito local demo 13',
    lat: 31.6903638,
    lng: -106.4245478,
  },
  {
    label: 'Delicias, Chihuahua',
    state: 'Chihuahua',
    municipality: 'Delicias',
    federalDistrict: 'Distrito federal demo 2',
    localDistrict: 'Distrito local demo 20',
    lat: 28.1871201,
    lng: -105.4595306,
  },
  {
    label: 'Cuauhtemoc, Chihuahua',
    state: 'Chihuahua',
    municipality: 'Cuauhtemoc',
    federalDistrict: 'Distrito federal demo 9',
    localDistrict: 'Distrito local demo 18',
    lat: 28.4050886,
    lng: -106.86667,
  },
  {
    label: 'Hidalgo del Parral, Chihuahua',
    state: 'Chihuahua',
    municipality: 'Hidalgo del Parral',
    federalDistrict: 'Distrito federal demo 3',
    localDistrict: 'Distrito local demo 8',
    lat: 26.9328129,
    lng: -105.6663723,
  },
  {
    label: 'Todo Chihuahua',
    state: 'Chihuahua',
    municipality: 'Todo el estado',
    federalDistrict: 'Circunscripcion estatal',
    localDistrict: 'Todo el estado',
    lat: 28.633,
    lng: -106.0691,
  },
  {
    label: 'Monterrey, Nuevo Leon',
    state: 'Nuevo Leon',
    municipality: 'Monterrey',
    federalDistrict: 'Distrito federal 10',
    localDistrict: 'Distrito local 6',
    lat: 25.6866,
    lng: -100.3161,
  },
  {
    label: 'San Pedro Garza Garcia, Nuevo Leon',
    state: 'Nuevo Leon',
    municipality: 'San Pedro Garza Garcia',
    federalDistrict: 'Distrito federal 10',
    localDistrict: 'Distrito local 18',
    lat: 25.6505,
    lng: -100.4084,
  },
  {
    label: 'Todo Nuevo Leon',
    state: 'Nuevo Leon',
    municipality: 'Todo el estado',
    federalDistrict: 'Circunscripcion estatal',
    localDistrict: 'Todo el estado',
    lat: 25.5922,
    lng: -99.9962,
  },
];

const levels = ['Todos', 'Federal', 'Estatal', 'Municipal', 'Judicial'];
const officesByLevel = {
  Todos: [
    'Todos los cargos',
    'Presidencia de la Republica',
    'Senaduria',
    'Diputacion federal',
    'Gubernatura',
    'Diputacion local',
    'Presidencia municipal',
    'Sindicatura',
    'Regiduria',
    'Alcaldia',
    'Junta municipal',
    'Ministratura SCJN',
    'Magistratura del Tribunal Electoral',
    'Magistratura del Tribunal de Disciplina Judicial',
    'Magistratura de Circuito',
    'Juzgado de Distrito',
    'Magistratura local',
    'Juzgado local',
  ],
  Federal: ['Todos los cargos', 'Presidencia de la Republica', 'Senaduria', 'Diputacion federal'],
  Estatal: ['Todos los cargos', 'Gubernatura', 'Diputacion local'],
  Municipal: ['Todos los cargos', 'Presidencia municipal', 'Sindicatura', 'Regiduria', 'Alcaldia', 'Junta municipal'],
  Judicial: [
    'Todos los cargos',
    'Ministratura SCJN',
    'Magistratura del Tribunal Electoral',
    'Magistratura del Tribunal de Disciplina Judicial',
    'Magistratura de Circuito',
    'Juzgado de Distrito',
    'Magistratura local',
    'Juzgado local',
  ],
};
const offices = officesByLevel.Todos;
const publicationTopicOptions = [
  'Sin tema',
  'Economia',
  'Salud',
  'Educacion',
  'Medio ambiente',
  'Seguridad',
  'Politica Social',
  'Libertad Ciudadana',
  'Pueblos originarios',
  'Poblacion LGBT',
  'Politica externa',
];
const topics = ['Todos', ...publicationTopicOptions.filter((topic) => topic !== 'Sin tema')];
const editableTopics = publicationTopicOptions.filter((topic) => topic !== 'Sin tema');
const partyCatalog = [
  { name: 'Intuicion Mistica', shortName: 'IM', color: '#6A0DAD', description: 'Partido de identidad mistica, espiritual y profunda.' },
  { name: 'Alianza Coquette', shortName: 'AC', color: '#FFB7C5', description: 'Partido de identidad estetica, ordenada y comunitaria.' },
  { name: 'Partido Salvando Mexico', shortName: 'PSM', color: '#DC143C', description: 'Partido de identidad intensa, pasional y rebelde.' },
  { name: "Partidon't Care", shortName: 'PDC', color: '#89CC04', description: 'Partido de identidad disruptiva, electrica y juvenil.' },
  { name: 'Union Malaventurada', shortName: 'PUM', color: '#0A0A0F', description: 'Partido de identidad melancolica, sobria y profunda.' },
  { name: 'Amor Eterno por Chihuahua', shortName: 'AEC', color: '#1E90FF', description: 'Partido de identidad alegre, brillante y chihuahuense.' },
];

function App() {
  const [politicians, setPoliticians] = useState(mockPoliticians);
  const [parties, setParties] = useState(partyCatalog);
  const [dataStatus, setDataStatus] = useState(isSupabaseConfigured ? 'Conectando a Supabase' : 'Demo local');
  const [entryMode, setEntryMode] = useState(null);
  const [view, setView] = useState('feed');
  const [politicianCode, setPoliticianCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [location, setLocation] = useState(locationPresets[0]);
  const [level, setLevel] = useState('Todos');
  const [office, setOffice] = useState('Todos los cargos');
  const [topic, setTopic] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('General');
  const [contentMode, setContentMode] = useState('feed');
  const [sectionQuery, setSectionQuery] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState('1');
  const [ownerId, setOwnerId] = useState(null);
  const [handledSharedLink, setHandledSharedLink] = useState(false);
  const [imageViewer, setImageViewer] = useState(null);
  const [isCandidatePortalOpen, setIsCandidatePortalOpen] = useState(false);
  const [isPartyAdminOpen, setIsPartyAdminOpen] = useState(false);
  const [partyAdminUnlocked, setPartyAdminUnlocked] = useState(false);
  const availableOffices = officesByLevel[level] ?? officesByLevel.Todos;

  const openProfileAtTop = (id) => {
    setActiveId(id);
    setView('profile');
    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadPoliticians() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('politician_feed')
        .select('*')
        .order('name', { ascending: true });

      if (cancelled) return;

      if (error) {
        setDataStatus('Demo local');
        console.warn('Supabase politician_feed error:', error.message);
        return;
      }

      if (!data?.length) {
        setDataStatus('Supabase conectado, sin perfiles publicados');
        return;
      }

      const nextPoliticians = data.map(mapSupabasePolitician);
      setPoliticians(nextPoliticians);
      setActiveId(nextPoliticians[0].id);
      setSelectedIds([]);
      setDataStatus('Supabase conectado');
    }

    loadPoliticians();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadParties() {
      try {
        const response = await fetchWithTimeout(getApiUrl('/api/parties'), {}, 6000);
        const payload = await parseApiPayload(response);
        if (!cancelled && payload.parties?.length) {
          setParties(mergeParties(payload.parties));
        }
      } catch {
        if (!cancelled) setParties(mergeParties([]));
      }
    }

    if (apiBaseUrl) {
      loadParties();
    } else {
      setParties(mergeParties([]));
    }

    return () => {
      cancelled = true;
    };
  }, [politicians.length]);

  useEffect(() => {
    if (!availableOffices.includes(office)) {
      setOffice('Todos los cargos');
    }
  }, [availableOffices, office]);

  useEffect(() => {
    if (handledSharedLink || entryMode || typeof window === 'undefined') return;

    const profileId = new URLSearchParams(window.location.search).get('perfil');
    if (!profileId) {
      setHandledSharedLink(true);
      return;
    }

    const sharedPolitician = politicians.find((politician) => politician.id === profileId);
    if (!sharedPolitician) return;

    setActiveId(sharedPolitician.id);
    setEntryMode('citizen');
    setView('profile');
    setHandledSharedLink(true);
  }, [entryMode, handledSharedLink, politicians]);

  const visiblePoliticians = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery);

    return politicians.filter((politician) => {
      const isStateWide = politician.municipality === 'Todo el estado';
      const allStateSelected = location.municipality === 'Todo el estado';
      const sameState = politician.state === location.state;
      const sameMunicipality = allStateSelected || politician.municipality === location.municipality || isStateWide;
      const sameFederalDistrict =
        !location.federalDistrictFilter ||
        politician.level !== 'Federal' ||
        politician.office !== 'Diputacion federal' ||
        isDemoDistrict(politician.federalDistrict) ||
        politician.federalDistrict === location.federalDistrict ||
        politician.federalDistrict === 'Circunscripcion estatal';
      const sameLocalDistrict =
        !location.localDistrictFilter ||
        politician.level !== 'Estatal' ||
        isDemoDistrict(politician.localDistrict) ||
        politician.localDistrict === location.localDistrict ||
        politician.localDistrict === 'Todo el estado' ||
        politician.localDistrict === 'Circuito judicial estatal';
      const levelMatches = level === 'Todos' || politician.level === level;
      const officeMatches = office === 'Todos los cargos' || politician.office === office;
      const postTopics = (politician.posts ?? []).flatMap((post) => post.tags ?? []);
      const topicMatches = topic === 'Todos' || politician.topics.includes(topic) || postTopics.includes(topic);
      const searchMatches = !normalizedSearch || getSearchText(politician, searchScope).includes(normalizedSearch);

      return sameState && sameMunicipality && sameFederalDistrict && sameLocalDistrict && levelMatches && officeMatches && topicMatches && searchMatches;
    });
  }, [location, level, office, topic, politicians, searchQuery, searchScope]);

  const visibleFeedPosts = useMemo(() => {
    return visiblePoliticians.flatMap((politician) => {
      const posts = topic === 'Todos'
        ? politician.posts ?? []
        : (politician.posts ?? []).filter((post) => (post.tags ?? []).includes(topic));

      if (!posts.length) {
        return [{
          politician,
          post: null,
          key: `${politician.id}-perfil`,
        }];
      }

      return posts.map((post, index) => ({
        politician,
        post,
        key: post.id || `${politician.id}-post-${index}`,
      }));
    }).sort((a, b) => getPostTime(b.post, b.politician) - getPostTime(a.post, a.politician));
  }, [topic, visiblePoliticians]);

  const activePolitician = politicians.find((politician) => politician.id === activeId) ?? visiblePoliticians[0] ?? politicians[0];
  const selectedPoliticians = politicians.filter((politician) => selectedIds.includes(politician.id));

  const toggleCompare = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id].slice(-2);
    });
  };

  const openComparePage = () => {
    setSelectedIds([]);
    setView('compare');
  };

  const selectLocation = (label) => {
    const nextLocation = locationPresets.find((preset) => preset.label === label) ?? locationPresets[0];
    setLocation(nextLocation);
    setSectionError('');
    resetFeedFilters();
  };

  const selectElectoralState = (state) => {
    const catalog = electoralCatalog[state];
    setSectionQuery('');
    setSectionError('');

    if (!catalog) {
      setLocation({
        label: state,
        state,
        municipality: 'Todo el estado',
        federalDistrict: 'Cartografia pendiente',
        localDistrict: 'Cartografia pendiente',
        lat: 23.6345,
        lng: -102.5528,
      });
      resetFeedFilters();
      return;
    }

    setLocation({
      label: `Todo ${state}`,
      state,
      municipality: 'Todo el estado',
      federalDistrict: 'Todos los distritos federales',
      localDistrict: 'Todos los distritos locales',
      lat: 28.633,
      lng: -106.0691,
    });
    resetFeedFilters();
  };

  const selectElectoralMunicipality = (municipalityName) => {
    const catalog = electoralCatalog[location.state];
    if (!catalog) return;

    const municipality = catalog.municipalities.find((item) => item.name === municipalityName);
    setSectionQuery('');
    setSectionError('');

    if (!municipality || municipalityName === 'Todo el estado') {
      setLocation({
        label: `Todo ${location.state}`,
        state: location.state,
        municipality: 'Todo el estado',
        federalDistrict: 'Todos los distritos federales',
        localDistrict: 'Todos los distritos locales',
        lat: 28.633,
        lng: -106.0691,
      });
      resetFeedFilters();
      return;
    }

    const localDistrict = catalog.localDistricts.find((district) => district.number === municipality.localDistricts[0]);
    const federalDistrict = catalog.federalDistricts.find((district) => district.number === municipality.federalDistricts[0]);
    const localLabel = municipality.localDistricts.length === 1 ? localDistrict?.label : `${municipality.localDistricts.length} distritos locales`;
    const federalLabel = municipality.federalDistricts.length === 1 ? federalDistrict?.label : `${municipality.federalDistricts.length} distritos federales`;

    setLocation({
      label: `${municipality.name}, ${location.state}`,
      state: location.state,
      municipality: municipality.name,
      federalDistrict: federalLabel ?? 'Distrito federal pendiente',
      localDistrict: localLabel ?? 'Distrito local pendiente',
      localDistrictNumber: '',
      federalDistrictNumber: '',
      lat: 28.633,
      lng: -106.0691,
    });
    resetFeedFilters();
  };

  const selectElectoralDistrict = (districtType, districtNumber) => {
    const catalog = electoralCatalog[location.state];
    if (!catalog) return;

    if (!districtNumber) {
      setLocation((current) => ({
        ...current,
        federalDistrict: districtType === 'federal' ? 'Todos los distritos federales' : current.federalDistrict,
        localDistrict: districtType === 'local' ? 'Todos los distritos locales' : current.localDistrict,
        federalDistrictNumber: districtType === 'federal' ? '' : current.federalDistrictNumber,
        localDistrictNumber: districtType === 'local' ? '' : current.localDistrictNumber,
        federalDistrictHead: districtType === 'federal' ? '' : current.federalDistrictHead,
        localDistrictHead: districtType === 'local' ? '' : current.localDistrictHead,
        federalDistrictFilter: districtType === 'federal' ? false : current.federalDistrictFilter,
        localDistrictFilter: districtType === 'local' ? false : current.localDistrictFilter,
      }));
      resetFeedFilters();
      return;
    }

    const districtList = districtType === 'local' ? catalog.localDistricts : catalog.federalDistricts;
    const district = districtList.find((item) => item.number === districtNumber);
    if (!district) return;

    setLocation((current) => ({
      ...current,
      label: `${district.label} - ${current.municipality === 'Todo el estado' ? current.state : current.municipality}`,
      federalDistrict: districtType === 'federal' ? district.label : current.federalDistrict,
      localDistrict: districtType === 'local' ? district.label : current.localDistrict,
      federalDistrictNumber: districtType === 'federal' ? district.number : current.federalDistrictNumber,
      localDistrictNumber: districtType === 'local' ? district.number : current.localDistrictNumber,
      federalDistrictHead: districtType === 'federal' ? district.head : current.federalDistrictHead,
      localDistrictHead: districtType === 'local' ? district.head : current.localDistrictHead,
      federalDistrictFilter: districtType === 'federal' ? true : current.federalDistrictFilter,
      localDistrictFilter: districtType === 'local' ? true : current.localDistrictFilter,
    }));
    resetFeedFilters();
  };

  const resetFeedFilters = () => {
    setLevel('Todos');
    setOffice('Todos los cargos');
    setTopic('Todos');
    setSearchQuery('');
    setSearchScope('General');
  };

  const searchElectoralSection = async (event) => {
    event.preventDefault();
    const normalizedSection = sectionQuery.replace(/\D/g, '').replace(/^0+/, '') || '0';
    const { chihuahuaSectionLookup } = await import('./data/chihuahuaSections');
    const sectionData = chihuahuaSectionLookup[normalizedSection];

    if (!sectionData) {
      setSectionError('No encontramos esa seccion en el registro electoral de Chihuahua.');
      return;
    }

    const district = chihuahuaLocalDistricts[sectionData.localDistrictNumber];
    setLocation({
      label: `Seccion ${sectionData.section} - ${sectionData.municipality}`,
      state: 'Chihuahua',
      municipality: sectionData.municipality,
      federalDistrict: sectionData.federalDistrict,
      localDistrict: sectionData.localDistrict,
      localDistrictNumber: sectionData.localDistrictNumber,
      localDistrictHead: sectionData.localDistrictHead,
      federalDistrictHead: sectionData.federalDistrictHead,
      electoralSection: sectionData.section,
      sectionType: sectionData.sectionType,
      federalDistrictFilter: true,
      localDistrictFilter: true,
      lat: district?.lat ?? 28.633,
      lng: district?.lng ?? -106.0691,
    });
    setSectionQuery(sectionData.section);
    setSectionError('');
    resetFeedFilters();
  };

  const enterAsCitizen = () => {
    setEntryMode('citizen');
    setView('feed');
    setContentMode('feed');
    setLoginError('');
  };

  const enterAsPolitician = (event) => {
    event.preventDefault();
    const normalizedCode = normalizeText(politicianCode);
    const matchedPolitician = politicians.find((politician) => normalizeText(politician.governmentId) === normalizedCode);

    if (!matchedPolitician) {
      setLoginError('No encontramos un perfil verificado con ese codigo. Revisa el ID o intenta cuando el registro oficial ya este cargado.');
      return;
    }

    setActiveId(matchedPolitician.id);
    setOwnerId(matchedPolitician.id);
    setEntryMode('politician');
    setView('profile');
    setLoginError('');
    setIsCandidatePortalOpen(false);
  };

  const goLanding = () => {
    setEntryMode(null);
    setView('feed');
    setContentMode('feed');
    setOwnerId(null);
    setLoginError('');
    setIsCandidatePortalOpen(false);
  };

  const openFeed = () => {
    setView('feed');
    setContentMode('feed');
  };

  const openChat = () => {
    setView('feed');
    setContentMode('chat');
  };

  const saveParty = async (party, password) => {
    const method = party.id ? 'PUT' : 'POST';
    const path = party.id ? `/api/parties/${party.id}` : '/api/parties';
    const response = await fetchWithTimeout(getApiUrl(path), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, party }),
    });
    const payload = await parseApiPayload(response);
    if (!payload.party) throw new Error('El servidor no regreso el partido guardado.');
    setParties((current) => mergeParties([payload.party, ...current]));
    setPoliticians((current) =>
      current.map((politician) =>
        normalizeText(politician.party) === normalizeText(payload.party.name)
          ? { ...politician, party: payload.party.name, partyColor: payload.party.color }
          : politician,
      ),
    );
    return payload.party;
  };

  const updatePoliticianProfile = async (id, updates) => {
    const politician = politicians.find((item) => item.id === id);
    const response = await fetchWithTimeout(getApiUrl(`/api/politicians/${id}/profile`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        governmentPoliticianId: politician?.governmentId,
        profile: updates,
      }),
    });
    const payload = await parseApiPayload(response);
    if (!payload.profile) throw new Error('El servidor no regreso el perfil actualizado.');
    const savedProfile = payload.profile;

    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              ...savedProfile,
            }
          : politician,
      ),
    );

    return savedProfile;
  };

  const addPoliticianProposal = (id, proposal) => {
    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              topics: Array.from(new Set([...politician.topics, proposal.topic])),
              proposals: [...politician.proposals, proposal],
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
  };

  const addPoliticianPost = async (id, post) => {
    const politician = politicians.find((item) => item.id === id);
    const response = await fetchWithTimeout(getApiUrl(`/api/politicians/${id}/posts`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        governmentPoliticianId: politician?.governmentId,
        post,
      }),
    });
    const payload = await parseApiPayload(response);
    if (!payload.post) throw new Error('El servidor no regreso la publicacion guardada.');
    const savedPost = payload.post;

    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              topics: Array.from(new Set([...politician.topics, ...(savedPost.tags ?? [])])),
              posts: [savedPost, ...(politician.posts ?? [])],
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
    return savedPost;
  };

  const updatePoliticianValues = (id, values) => {
    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              values,
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
  };

  const updatePoliticianProposal = (id, proposalIndex, proposal) => {
    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              proposals: politician.proposals.map((item, index) => (index === proposalIndex ? proposal : item)),
              topics: Array.from(new Set(politician.proposals.map((item, index) => (index === proposalIndex ? proposal.topic : item.topic)))),
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
  };

  const deletePoliticianProposal = (id, proposalIndex) => {
    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              proposals: politician.proposals.filter((_, index) => index !== proposalIndex),
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
  };

  const updatePoliticianPost = async (id, postIndex, post) => {
    const politician = politicians.find((item) => item.id === id);
    const currentPost = politician?.posts?.[postIndex];
    if (!currentPost?.id) throw new Error('Esta publicacion todavia no tiene ID de base de datos.');

    const response = await fetchWithTimeout(getApiUrl(`/api/posts/${currentPost.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        politicianId: id,
        governmentPoliticianId: politician?.governmentId,
        post,
      }),
    });
    const payload = await parseApiPayload(response);
    if (!payload.post) throw new Error('El servidor no regreso la publicacion actualizada.');
    const savedPost = payload.post;

    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              posts: (politician.posts ?? []).map((item, index) => (index === postIndex ? savedPost : item)),
              topics: Array.from(new Set([...(politician.topics ?? []), ...(savedPost.tags ?? [])])),
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
    return savedPost;
  };

  const deletePoliticianPost = async (id, postIndex) => {
    const politician = politicians.find((item) => item.id === id);
    const currentPost = politician?.posts?.[postIndex];
    if (!currentPost?.id) throw new Error('Esta publicacion todavia no tiene ID de base de datos.');

    const response = await fetchWithTimeout(getApiUrl(`/api/posts/${currentPost.id}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        politicianId: id,
        governmentPoliticianId: politician?.governmentId,
      }),
    });
    await parseApiPayload(response);

    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              posts: (politician.posts ?? []).filter((_, index) => index !== postIndex),
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
  };

  if (!entryMode) {
    return (
      <LandingPage
        politicianCode={politicianCode}
        setPoliticianCode={setPoliticianCode}
        loginError={loginError}
        onCitizenEnter={enterAsCitizen}
        onPoliticianEnter={enterAsPolitician}
      />
    );
  }

  if (view === 'profile') {
    return (
      <main className="min-h-screen bg-ballot text-ink">
        <Header
          entryMode={entryMode}
          view={view}
          contentMode={contentMode}
          onLogo={goLanding}
          onPortal={() => setIsCandidatePortalOpen(true)}
          activePolitician={activePolitician}
          onFeed={openFeed}
          onChat={openChat}
          onProfile={() => {
            if (ownerId) {
              openProfileAtTop(ownerId);
            } else {
              setView('profile');
            }
          }}
          onCompare={openComparePage}
          onPartyAdmin={() => setIsPartyAdminOpen(true)}
        />
        <CandidateProfilePage
          politician={activePolitician}
          isOwner={entryMode === 'politician' && activePolitician.id === ownerId}
          onBack={() => setView('feed')}
          onUpdateProfile={(updates) => updatePoliticianProfile(activePolitician.id, updates)}
          onUpdateValues={(values) => updatePoliticianValues(activePolitician.id, values)}
          onAddProposal={(proposal) => addPoliticianProposal(activePolitician.id, proposal)}
          onUpdateProposal={(index, proposal) => updatePoliticianProposal(activePolitician.id, index, proposal)}
          onDeleteProposal={(index) => deletePoliticianProposal(activePolitician.id, index)}
          onAddPost={(post) => addPoliticianPost(activePolitician.id, post)}
          onUpdatePost={(index, post) => updatePoliticianPost(activePolitician.id, index, post)}
          onDeletePost={(index) => deletePoliticianPost(activePolitician.id, index)}
          onOpenImage={setImageViewer}
          parties={parties}
        />
        <ImageViewer image={imageViewer} onClose={() => setImageViewer(null)} />
        {isCandidatePortalOpen && (
          <CandidatePortalModal
            politicianCode={politicianCode}
            setPoliticianCode={setPoliticianCode}
            loginError={loginError}
            onPoliticianEnter={enterAsPolitician}
            onClose={() => setIsCandidatePortalOpen(false)}
          />
        )}
        {isPartyAdminOpen && (
          <PartyAdminModal
            parties={parties}
            unlocked={partyAdminUnlocked}
            setUnlocked={setPartyAdminUnlocked}
            onSave={saveParty}
            onClose={() => setIsPartyAdminOpen(false)}
          />
        )}
      </main>
    );
  }

  if (view === 'compare') {
    return (
      <main className="min-h-screen bg-ballot text-ink">
        <Header
          entryMode={entryMode}
          view={view}
          contentMode={contentMode}
          onLogo={goLanding}
          onPortal={() => setIsCandidatePortalOpen(true)}
          activePolitician={activePolitician}
          onFeed={openFeed}
          onChat={openChat}
          onProfile={() => {
            if (ownerId) {
              openProfileAtTop(ownerId);
            } else {
              setView('profile');
            }
          }}
          onCompare={openComparePage}
          onPartyAdmin={() => setIsPartyAdminOpen(true)}
        />
        <ComparePage
          politicians={politicians}
          selectedPoliticians={selectedPoliticians}
          selectedIds={selectedIds}
          onToggle={toggleCompare}
          onOpenProfile={(id) => {
            openProfileAtTop(id);
          }}
        />
        <ImageViewer image={imageViewer} onClose={() => setImageViewer(null)} />
        {isCandidatePortalOpen && (
          <CandidatePortalModal
            politicianCode={politicianCode}
            setPoliticianCode={setPoliticianCode}
            loginError={loginError}
            onPoliticianEnter={enterAsPolitician}
            onClose={() => setIsCandidatePortalOpen(false)}
          />
        )}
        {isPartyAdminOpen && (
          <PartyAdminModal
            parties={parties}
            unlocked={partyAdminUnlocked}
            setUnlocked={setPartyAdminUnlocked}
            onSave={saveParty}
            onClose={() => setIsPartyAdminOpen(false)}
          />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ballot text-ink">
      <Header
        entryMode={entryMode}
        view={view}
        contentMode={contentMode}
        onLogo={goLanding}
        onPortal={() => setIsCandidatePortalOpen(true)}
        activePolitician={activePolitician}
        onFeed={openFeed}
        onChat={openChat}
        onProfile={() => {
          if (ownerId) {
            openProfileAtTop(ownerId);
          } else {
            setView('profile');
          }
        }}
        onCompare={openComparePage}
        onPartyAdmin={() => setIsPartyAdminOpen(true)}
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 pb-24 sm:px-6 md:pb-5 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <LocationPanel
            location={location}
            onStateChange={selectElectoralState}
            onMunicipalityChange={selectElectoralMunicipality}
            onDistrictChange={selectElectoralDistrict}
            sectionQuery={sectionQuery}
            setSectionQuery={setSectionQuery}
            sectionError={sectionError}
            onSectionSearch={searchElectoralSection}
          />
          <Filters level={level} setLevel={setLevel} office={office} setOffice={setOffice} topic={topic} setTopic={setTopic} availableOffices={availableOffices} />
        </aside>

        <section className="order-1 min-w-0 space-y-4 lg:order-2">
          {contentMode === 'feed' ? (
            <>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchScope={searchScope} setSearchScope={setSearchScope} />
              <FeedHeader
                count={visibleFeedPosts.length}
                location={location}
                level={level}
                office={office}
                topic={topic}
                searchQuery={searchQuery}
                searchScope={searchScope}
              />
              <div className="space-y-4">
                {visibleFeedPosts.map(({ politician, post, key }) => (
                  <PoliticianPost
                    key={key}
                    politician={politician}
                    post={post}
                    selected={selectedIds.includes(politician.id)}
                    active={activePolitician.id === politician.id}
                              onOpen={() => {
                                openProfileAtTop(politician.id);
                              }}
                    onOpenImage={setImageViewer}
                  />
                ))}
                {visibleFeedPosts.length === 0 && <EmptyState onReset={resetFeedFilters} />}
              </div>
            </>
          ) : (
            <CivicChatbot location={location} />
          )}
        </section>
      </div>
      <ImageViewer image={imageViewer} onClose={() => setImageViewer(null)} />
      {isCandidatePortalOpen && (
        <CandidatePortalModal
          politicianCode={politicianCode}
          setPoliticianCode={setPoliticianCode}
          loginError={loginError}
          onPoliticianEnter={enterAsPolitician}
          onClose={() => setIsCandidatePortalOpen(false)}
        />
      )}
      {isPartyAdminOpen && (
        <PartyAdminModal
          parties={parties}
          unlocked={partyAdminUnlocked}
          setUnlocked={setPartyAdminUnlocked}
          onSave={saveParty}
          onClose={() => setIsPartyAdminOpen(false)}
        />
      )}
    </main>
  );
}

function LandingPage({ politicianCode, setPoliticianCode, loginError, onCitizenEnter, onPoliticianEnter }) {
  const [isCandidateLoginOpen, setIsCandidateLoginOpen] = useState(false);

  return (
    <main className="bg-ballot text-ink">
      <section className="grain border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCandidateLoginOpen(true)}
              className="rounded-full border border-ink/10 bg-ink px-5 py-2 text-sm font-black text-white shadow-lg shadow-ink/10 transition hover:bg-ink/90"
            >
              Portal de candidatos
            </button>
          </div>

          <div className="mx-auto max-w-3xl text-center py-10 sm:py-16 animate-fade-up">
            <h1 className="mt-8 text-4xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
              El proyecto para la ciudadanía que quiere entender su elección local.
            </h1>
            <p className="mt-6 text-base leading-8 text-ink/70 sm:text-lg">
              Consulta candidatas, cargos y propuestas de tu distrito sin barreras. Las personas candidatas verificadas reclaman su perfil con código oficial para publicar propuestas reales y confiables.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <button
                type="button"
                onClick={onCitizenEnter}
                className="glow-pulse rounded-full bg-civic px-10 py-4 text-base font-black text-white shadow-xl transition hover:scale-105 hover:bg-civic/90"
              >
                Acceder
              </button>
            </div>
          </div>
        </div>
      </section>

      {isCandidateLoginOpen && (
        <CandidatePortalModal
          politicianCode={politicianCode}
          setPoliticianCode={setPoliticianCode}
          loginError={loginError}
          onPoliticianEnter={onPoliticianEnter}
          onClose={() => setIsCandidateLoginOpen(false)}
        />
      )}
    </main>
  );
}

function CandidatePortalModal({ politicianCode, setPoliticianCode, loginError, onPoliticianEnter, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-4 py-6 backdrop-blur-sm">
      <form onSubmit={onPoliticianEnter} className="w-full max-w-lg rounded-3xl border border-white/10 bg-ink p-6 text-white shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-maize">Acceso de candidatura</p>
            <h2 className="mt-2 text-2xl font-black">Ingresa con tu ID oficial</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-lg font-black text-white/75 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar acceso de candidato"
          >
            x
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/70">
          Usa el codigo oficial para reclamar tu perfil, editar informacion y publicar propuestas verificadas.
        </p>
        <label className="mt-6 block text-sm font-black uppercase tracking-[0.12em] text-white/60">
          ID oficial
          <input
            className="mt-3 h-14 w-full rounded-2xl border border-white/15 bg-white px-4 text-sm font-black text-ink outline-none focus:border-maize"
            value={politicianCode}
            onChange={(event) => setPoliticianCode(event.target.value)}
            placeholder="MX-CHIH-CHIHUAHUA-EST-0054"
          />
        </label>
        {loginError && (
          <p className="mt-4 rounded-2xl bg-signal/20 p-4 text-sm font-bold text-white">
            {loginError}
          </p>
        )}
        <button className="mt-6 h-14 w-full rounded-full bg-maize text-base font-black text-ink transition hover:bg-maize/90">
          Validar codigo
        </button>
        <p className="mt-4 text-xs font-bold leading-5 text-white/55">
          En produccion este acceso debe continuar con registro seguro, email/magic link o autenticacion de dos factores.
        </p>
      </form>
    </div>
  );
}

function PartyAdminModal({ parties, unlocked, setUnlocked, onSave, onClose }) {
  const [password, setPassword] = useState('');
  const [draft, setDraft] = useState({ name: '', shortName: '', color: '#6A0DAD', description: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isSaving, setIsSaving] = useState(false);

  const selectParty = (party) => {
    setDraft({
      id: party.id,
      name: party.name,
      shortName: party.shortName ?? '',
      color: party.color ?? '#0A0A0F',
      description: party.description ?? '',
    });
    setMessage('');
  };

  const save = (event) => {
    event.preventDefault();
    if (!unlocked) {
      setUnlocked(true);
      setMessageType('success');
      setMessage('Modo de edicion abierto. Ahora puedes guardar partidos.');
      return;
    }

    setIsSaving(true);
    setMessageType('success');
    setMessage('Guardando partido...');
    Promise.resolve(onSave(draft, password))
      .then((savedParty) => {
        setDraft({ id: savedParty.id, name: savedParty.name, shortName: savedParty.shortName, color: savedParty.color, description: savedParty.description });
        setMessageType('success');
        setMessage('Partido guardado correctamente.');
      })
      .catch((error) => {
        setMessageType('error');
        setMessage(error.message);
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-ink/10 bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Administracion</p>
            <h2 className="mt-1 text-2xl font-black">Perfiles de partidos</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5" aria-label="Cerrar partidos">
            x
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setDraft({ name: '', shortName: '', color: '#6A0DAD', description: '' })}
              className="h-10 w-full rounded-md bg-ink text-sm font-black text-white hover:bg-ink/90"
            >
              Nuevo partido
            </button>
            {parties.map((party) => (
              <button
                key={`${party.name}-${party.color}`}
                type="button"
                onClick={() => selectParty(party)}
                className="flex w-full items-center gap-3 rounded-lg border border-ink/10 p-3 text-left transition hover:border-civic/30 hover:bg-ballot"
              >
                <span className="h-8 w-8 shrink-0 rounded-md" style={{ backgroundColor: party.color }} />
                <span>
                  <span className="block text-sm font-black">{party.name}</span>
                  <span className="block text-xs font-bold text-ink/45">{party.shortName || 'Sin siglas'}</span>
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={save} className="space-y-3">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Contrasena de administracion</span>
              <input
                type="password"
                className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Solo equipo administrador"
              />
            </label>
            <AdminInput label="Nombre del partido" value={draft.name} onChange={(value) => setDraft((current) => ({ ...current, name: value }))} />
            <AdminInput label="Siglas" value={draft.shortName} onChange={(value) => setDraft((current) => ({ ...current, shortName: value }))} />
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Color del banner</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-[120px_1fr]">
                <input
                  type="color"
                  className="h-10 w-full rounded-md border border-ink/15 bg-ballot p-1"
                  value={draft.color}
                  onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value.toUpperCase() }))}
                />
                <input
                  className="h-10 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
                  value={draft.color}
                  onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
                  placeholder="#6A0DAD"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Descripcion</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            {message && (
              <p className={`rounded-md p-3 text-sm font-black ${messageType === 'error' ? 'bg-signal/10 text-signal' : 'bg-civic/10 text-civic'}`}>
                {message}
              </p>
            )}
            <button disabled={isSaving} className="h-11 w-full rounded-md bg-civic text-sm font-black text-white hover:bg-civic/90 disabled:cursor-wait disabled:opacity-60">
              {isSaving ? 'Guardando...' : unlocked ? 'Guardar partido' : 'Desbloquear edicion'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function LandingMetric({ value, label }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold leading-5 text-ink/58">{label}</p>
    </div>
  );
}

function Header({ entryMode, view, contentMode, onLogo, onPortal, activePolitician, onFeed, onChat, onProfile, onCompare, onPartyAdmin }) {
  const isFeedActive = view === 'feed' && contentMode === 'feed';
  const isChatActive = view === 'feed' && contentMode === 'chat';
  const isCompareActive = view === 'compare';
  const navButtonClass = (active) =>
    `rounded-md px-3 py-2 transition ${active ? 'bg-ink text-white shadow-panel' : 'text-ink/62 hover:bg-ink/5 hover:text-ink'}`;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ballot/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={onLogo} className="flex min-w-0 items-center gap-3 font-black transition hover:text-civic">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ink text-sm text-white">CD</span>
            <span className="truncate">CyberDemocracia</span>
          </button>
          <nav className="hidden items-center gap-2 text-sm font-bold md:flex">
            <button className={navButtonClass(isFeedActive)} onClick={onFeed}>Feed</button>
            <button className={navButtonClass(isChatActive)} onClick={onChat}>IA</button>
            <button className={navButtonClass(isCompareActive)} onClick={onCompare}>Comparar</button>
            {entryMode === 'politician' && <button className={navButtonClass(view === 'profile')} onClick={onProfile}>Mi perfil</button>}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={onPartyAdmin} className="rounded-md border border-ink/15 bg-white px-3 py-2 text-xs font-black text-ink/65 hover:bg-ink/5">
              Partidos
            </button>
            <button onClick={entryMode === 'politician' ? onProfile : onPortal} className="rounded-md border border-civic/25 bg-white px-3 py-2 text-xs font-black text-civic hover:bg-civic/10">
              {entryMode === 'politician' ? activePolitician.name : 'Portal para candidatos'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="mobile-nav-safe fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-ballot/95 backdrop-blur-sm md:hidden">
        <div className="grid grid-cols-4 divide-x divide-ink/10">
          <button
            onClick={onFeed}
            className={`flex flex-col items-center gap-1 py-3 text-xs font-black transition ${isFeedActive ? 'text-civic' : 'text-ink/55 active:text-civic'}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h18M3 10h18M3 15h12" />
            </svg>
            Feed
          </button>
          <button
            onClick={onChat}
            className={`flex flex-col items-center gap-1 py-3 text-xs font-black transition ${isChatActive ? 'text-civic' : 'text-ink/55 active:text-civic'}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" />
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M2 14h2M20 14h2M9 13v2M15 13v2" />
            </svg>
            IA
          </button>
          <button
            onClick={onCompare}
            className={`flex flex-col items-center gap-1 py-3 text-xs font-black transition ${isCompareActive ? 'text-civic' : 'text-ink/55 active:text-civic'}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="8" height="16" rx="1" />
              <rect x="14" y="4" width="8" height="16" rx="1" />
            </svg>
            Comparar
          </button>
          <button
            onClick={entryMode === 'politician' ? onProfile : onPortal}
            className="flex flex-col items-center gap-1 py-3 text-xs font-black text-ink/55 transition active:text-civic"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            {entryMode === 'politician' ? 'Perfil' : 'Portal'}
          </button>
        </div>
      </nav>
    </>
  );
}

function ContentModeToggle({ contentMode, setContentMode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-2 shadow-panel">
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: 'feed', label: 'Ver feed', description: 'Candidaturas y publicaciones' },
          { id: 'chat', label: 'Habla con IA', description: 'Consulta la base de datos' },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setContentMode(option.id)}
            className={`rounded-md px-4 py-3 text-left transition ${
              contentMode === option.id ? 'bg-ink text-white shadow-panel' : 'bg-ballot text-ink hover:bg-ink/5'
            }`}
          >
            <span className="block text-sm font-black">{option.label}</span>
            <span className={`mt-1 block text-xs font-bold ${contentMode === option.id ? 'text-white/65' : 'text-ink/50'}`}>{option.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function SearchBar({ searchQuery, setSearchQuery, searchScope, setSearchScope }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <label className="relative block">
          <span className="sr-only">Buscar candidato, ciudad, partido o cargo</span>
          <input
            className="h-12 w-full rounded-lg border border-ink/15 bg-ballot pl-4 pr-28 text-base font-bold outline-none placeholder:text-ink/40 focus:border-civic"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por nombre, ciudad, cargo, partido o tema"
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-md px-3 text-xs font-black text-ink/55 transition hover:bg-ink/5"
              onClick={() => setSearchQuery('')}
            >
              Limpiar
            </button>
          )}
        </label>
        <label className="block">
          <span className="sr-only">Filtro de busqueda</span>
          <select
            className="h-12 w-full rounded-lg border border-ink/15 bg-ballot px-3 text-sm font-black outline-none focus:border-civic"
            value={searchScope}
            onChange={(event) => setSearchScope(event.target.value)}
          >
            <option>General</option>
            <option>Nombre</option>
            <option>Ciudad</option>
            <option>Cargo</option>
            <option>Partido</option>
            <option>Tema</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function LocationPanel({ location, onStateChange, onMunicipalityChange, onDistrictChange, sectionQuery, setSectionQuery, sectionError, onSectionSearch }) {
  const catalog = electoralCatalog[location.state];
  const municipalityOptions = catalog?.municipalities ?? [];
  const selectedMunicipality = municipalityOptions.find((item) => item.name === location.municipality);
  const localDistrictOptions = selectedMunicipality
    ? catalog.localDistricts.filter((district) => selectedMunicipality.localDistricts.includes(district.number))
    : catalog?.localDistricts ?? [];
  const federalDistrictOptions = selectedMunicipality
    ? catalog.federalDistricts.filter((district) => selectedMunicipality.federalDistricts.includes(district.number))
    : catalog?.federalDistricts ?? [];
  const hasCatalog = Boolean(catalog);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Ubicacion electoral</p>
      <h1 className="mt-2 text-2xl font-black leading-tight">Encuentra a quienes aparecen en tu boleta.</h1>
      <p className="mt-3 text-sm leading-6 text-ink/68">
        La seccion electoral es la ruta mas precisa: cruza municipio, distrito local y distrito federal. Si no la tienes a la mano, puedes empezar por estado y municipio.
      </p>

      <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-ink/45" htmlFor="state-select">
        Selecciona tu estado
      </label>
      <select
        id="state-select"
        className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-black outline-none focus:border-civic"
        value={location.state}
        onChange={(event) => onStateChange(event.target.value)}
      >
        {mexicoStates.map((state) => (
          <option key={state}>{state}</option>
        ))}
      </select>
      {!hasCatalog && (
        <p className="mt-2 rounded-md bg-maize/20 p-3 text-xs font-bold leading-5 text-ink/65">
          Por ahora el MVP tiene cartografia seccional cargada para Chihuahua. Este flujo ya queda listo para conectar mas estados despues.
        </p>
      )}

      <form onSubmit={onSectionSearch} className="mt-4 rounded-lg border border-civic/20 bg-civic/5 p-3">
        <label className="block text-xs font-black uppercase tracking-[0.12em] text-civic" htmlFor="electoral-section">
          Agrega tu seccion
        </label>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            id="electoral-section"
            inputMode="numeric"
            pattern="[0-9]*"
            className="h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm font-black outline-none focus:border-civic"
            value={sectionQuery}
            onChange={(event) => setSectionQuery(event.target.value)}
            placeholder="Ej. 0747"
            disabled={!hasCatalog}
          />
          <button disabled={!hasCatalog} className="h-11 rounded-md bg-civic px-4 text-sm font-black text-white transition hover:bg-civic/90 disabled:cursor-not-allowed disabled:opacity-50">Buscar</button>
        </div>
        {sectionError ? (
          <p className="mt-2 text-xs font-bold leading-5 text-signal">{sectionError}</p>
        ) : (
          <p className="mt-2 text-xs font-bold leading-5 text-ink/55">La seccion aparece en tu credencial para votar. No guardamos este dato.</p>
        )}
      </form>

      <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-ink/45" htmlFor="municipality-select">
        O selecciona tu municipio
      </label>
      <select
        id="municipality-select"
        className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
        value={location.municipality}
        onChange={(event) => onMunicipalityChange(event.target.value)}
        disabled={!hasCatalog}
      >
        <option>Todo el estado</option>
        {municipalityOptions.map((municipality) => (
          <option key={municipality.name}>{municipality.name}</option>
        ))}
      </select>

      {hasCatalog && (
        <div className="mt-4 grid gap-3">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Distrito local</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
              value={location.localDistrictNumber ?? ''}
              onChange={(event) => onDistrictChange('local', event.target.value)}
            >
              <option value="">Todos los distritos locales</option>
              {localDistrictOptions.map((district) => (
                <option key={district.number} value={district.number}>
                  {district.label} - Cabecera: {district.head}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Distrito federal</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
              value={location.federalDistrictNumber ?? ''}
              onChange={(event) => onDistrictChange('federal', event.target.value)}
            >
              <option value="">Todos los distritos federales</option>
              {federalDistrictOptions.map((district) => (
                <option key={district.number} value={district.number}>
                  {district.label} - Cabecera: {district.head}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <DistrictMap location={location} />
      <div className="mt-4 rounded-lg bg-ink p-4 text-white">
        {location.electoralSection && <InfoRow light label="Seccion" value={`${location.electoralSection} (${location.sectionType})`} />}
        <InfoRow light label="Estado" value={location.state} />
        <InfoRow light label="Municipio" value={location.municipality} />
        <InfoRow light label="Distrito federal" value={location.federalDistrict} />
        <InfoRow light label="Distrito local" value={location.localDistrict} />
        {location.localDistrictHead && <InfoRow light label="Cabecera local" value={location.localDistrictHead} />}
      </div>
    </section>
  );
}

function DistrictMap({ location }) {
  const [mapStatus, setMapStatus] = useState(googleMapsApiKey ? 'loading' : 'missing-key');

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!googleMapsApiKey) return;

      try {
        await loadGoogleMaps();
        if (cancelled) return;
        setMapStatus('ready');
      } catch (error) {
        console.warn('Google Maps load error:', error);
        if (!cancelled) setMapStatus('error');
      }
    }

    initMap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mapStatus !== 'ready' || !window.google?.maps) return;

    const center = { lat: location.lat, lng: location.lng };
    const hasSection = Boolean(location.electoralSection);
    const isUrbanSplit = ['Chihuahua', 'Juarez'].includes(location.municipality);
    const map = new window.google.maps.Map(document.getElementById('district-map'), {
      center,
      zoom: hasSection ? (isUrbanSplit ? 11 : 8) : location.municipality === 'Todo el estado' ? 7 : 12,
      disableDefaultUI: true,
      zoomControl: true,
      mapId: 'cyberdemocracia-location-map',
    });

    new window.google.maps.Marker({
      position: center,
      map,
      title: location.label,
    });

    const district = chihuahuaLocalDistricts[location.localDistrictNumber];
    const districtBounds = buildMockDistrictPolygon(center, location);
    const districtPolygon = new window.google.maps.Polygon({
      paths: districtBounds,
      strokeColor: '#6e36ad',
      strokeOpacity: 0.95,
      strokeWeight: 2,
      fillColor: district?.color ?? '#6e36ad',
      fillOpacity: hasSection ? 0.34 : 0.18,
    });

    districtPolygon.setMap(map);
  }, [location, mapStatus]);

  if (mapStatus !== 'ready') {
    return (
      <div className="mt-4 grid h-56 place-items-center rounded-lg border border-ink/10 bg-ballot p-4 text-center">
        <div>
          <p className="text-sm font-black">{mapStatus === 'missing-key' ? 'Mapa no disponible' : 'Cargando mapa'}</p>
          <p className="mt-2 text-xs font-bold leading-5 text-ink/55">
            {mapStatus === 'missing-key'
              ? 'Puedes seguir usando la busqueda por seccion electoral.'
              : 'Estamos preparando la vista de tu distrito.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-ink/10">
      <div id="district-map" className="h-56 w-full" />
      <div className="bg-white px-3 py-2 text-xs font-bold text-ink/55">
        {location.electoralSection
          ? `${location.localDistrict} resaltado desde la seccion ${location.electoralSection}.`
          : 'Vista aproximada de la zona seleccionada.'}
      </div>
    </div>
  );
}

function Filters({ level, setLevel, office, setOffice, topic, setTopic, availableOffices }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Filtros</p>
      <div className="mt-4 space-y-4">
        <FilterGroup label="Nivel" options={levels} value={level} onChange={setLevel} singleColumn />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Cargo</span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
            value={office}
            onChange={(event) => setOffice(event.target.value)}
          >
            {availableOffices.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <FilterGroup label="Tema" options={topics} value={topic} onChange={setTopic} />
      </div>
    </section>
  );
}

function FilterGroup({ label, options, value, onChange, singleColumn = false }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <div className={`mt-2 gap-2 ${singleColumn ? 'grid grid-cols-1' : 'flex flex-wrap'}`}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-md px-3 py-2 text-xs font-black transition ${singleColumn ? 'w-full text-left' : ''} ${value === option ? 'bg-ink text-white' : 'bg-ink/5 text-ink/68 hover:bg-ink/10'}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function CivicRules() {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-signal">Reglas del feed</p>
      <div className="mt-3 space-y-3 text-sm font-bold text-ink/70">
        <Rule text="No hay likes, comentarios ni seguidores." />
        <Rule text="No hay ranking por popularidad o pago." />
        <Rule text="Solo se muestra informacion aplicable a tu zona." />
        <Rule text="Las propuestas se separan de ataques y propaganda." />
      </div>
    </section>
  );
}

function FeedHeader({ count, location, level, office, topic, searchQuery, searchScope }) {
  const activeFilters = [
    level !== 'Todos' ? level : null,
    office !== 'Todos los cargos' ? office : null,
    topic !== 'Todos' ? topic : null,
    searchQuery ? `${searchScope}: "${searchQuery}"` : null,
  ].filter(Boolean);

  return (
    <section id="feed" className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Feed civico neutral</p>
          <h2 className="mt-2 text-2xl font-black">Politicos y candidaturas de tu zona</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            {location.municipality}, {location.state}. El orden se basa en compatibilidad geografica y cargo, no en interacciones.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag>{location.municipality === 'Todo el estado' ? 'Todo el estado' : 'Municipio seleccionado'}</Tag>
            {activeFilters.length === 0 ? <Tag>Sin filtros adicionales</Tag> : activeFilters.map((filter) => <Tag key={filter}>{filter}</Tag>)}
          </div>
        </div>
        <div className="grid gap-2 sm:min-w-40">
          <div className="rounded-lg bg-ink px-4 py-3 text-white">
            <p className="text-3xl font-black leading-none">{count}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/60">
              {count === 1 ? 'resultado' : 'resultados'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PoliticianPost({ politician, post, active, onOpen, onOpenImage }) {
  const latestPost = post ?? politician.posts?.[0];
  const visibleTags = latestPost?.tags?.length ? latestPost.tags : politician.topics;
  const postTitle = latestPost?.title ?? 'Resumen del perfil';
  const postBody = latestPost?.body || politician.profile;
  const postType = latestPost?.type ?? 'Perfil publico';
  const postDate = latestPost?.createdAt || politician.updatedAt;

  return (
    <article className={`relative rounded-lg border bg-white p-4 pt-12 shadow-panel transition hover:-translate-y-0.5 ${active ? 'border-civic/40' : 'border-ink/10'}`}>
      <ReportButton politicianId={politician.id} contentId={latestPost?.id || 'perfil'} title={postTitle} />
      <div className="flex flex-wrap gap-2">
        {visibleTags.slice(0, 5).map((tag) => (
          <Tag key={`${politician.id}-${tag}`}>{tag}</Tag>
        ))}
        {visibleTags.length === 0 && <Tag>General</Tag>}
      </div>

      <div className="mt-4 flex items-start gap-3">
        <button
          onClick={onOpen}
          className="group grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-ink/10 bg-ink text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-civic hover:bg-civic hover:shadow-panel focus:outline-none focus:ring-2 focus:ring-civic/25"
          aria-label={`Abrir perfil de ${politician.name}`}
        >
          {politician.photoUrl ? (
            <img className="h-full w-full object-cover transition group-hover:scale-105" src={politician.photoUrl} alt="" />
          ) : (
            <span>{getInitials(politician.name)}</span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <button onClick={onOpen} className="group text-left">
            <span className="block text-xl font-black leading-tight transition group-hover:text-civic group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
              {politician.name}
            </span>
            <span className="mt-1 block text-sm font-bold text-ink/55">
              {politician.party} · {politician.office}
            </span>
          </button>
          <div className="mt-2 flex flex-wrap gap-2">
            <Tag>{politician.level}</Tag>
            <Tag>{politician.localDistrict}</Tag>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-civic">{postType}</p>
        <h3 className="mt-1 text-lg font-black leading-tight">{postTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-ink/72">{postBody}</p>
      </div>

      {latestPost?.imageUrl && (
        <button
          type="button"
          onClick={() => onOpenImage?.({ src: latestPost.imageUrl, alt: latestPost.title, title: postTitle, subtitle: politician.name })}
          className="group mt-4 block w-full overflow-hidden rounded-lg border border-ink/10 bg-ink/5 focus:outline-none focus:ring-2 focus:ring-civic/30"
          aria-label={`Abrir imagen de ${postTitle} en pantalla completa`}
        >
          <img className="h-56 w-full object-cover transition duration-200 group-hover:scale-[1.02] group-hover:opacity-90" src={latestPost.imageUrl} alt={latestPost.title} />
        </button>
      )}

      <div className="mt-4 space-y-3">
        {politician.proposals.slice(0, 2).map((proposal) => (
          <div key={`${politician.id}-${proposal.topic}`} className="rounded-lg bg-ballot p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-civic">{proposal.topic}</p>
            <p className="mt-1 text-sm leading-6 text-ink/78">{proposal.text}</p>
          </div>
        ))}
      </div>
      <footer className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-ink/10 pt-3 text-xs font-bold text-ink/52">
        <span>Publicado: {postDate}</span>
      </footer>
      <ShareButton
        className="mt-3"
        politicianId={politician.id}
        contentId={latestPost?.id || (latestPost ? 'publicacion' : 'perfil')}
        title={`${postTitle} - ${politician.name}`}
        text={`${postBody}\n\n${politician.name} | ${politician.office} | ${politician.party}`}
      />
    </article>
  );
}

function CandidateProfilePage({
  politician,
  isOwner,
  onBack,
  onUpdateProfile,
  onUpdateValues,
  onAddProposal,
  onUpdateProposal,
  onDeleteProposal,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  onOpenImage,
  parties,
}) {
  const [summaryStatus, setSummaryStatus] = useState('idle');
  const [aiSummary, setAiSummary] = useState('');
  const partyColor = getPartyColor(politician);

  const generateCandidateSummary = async () => {
    setSummaryStatus('loading');
    setAiSummary('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/summarize-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ politician }),
      });
      const responseText = await response.text();
      let payload = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        payload = { error: responseText || 'El servidor no regreso una respuesta valida.' };
      }

      if (!response.ok) {
        throw new Error(payload.detail ? `${payload.error} ${payload.detail}` : payload.error ?? `Error ${response.status}`);
      }

      if (!payload.summary) {
        throw new Error('La IA respondio sin resumen.');
      }

      setAiSummary(payload.summary);
      setSummaryStatus('ready');
    } catch (error) {
      setAiSummary(error.message);
      setSummaryStatus('error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 pb-24 sm:px-6 md:pb-5 lg:px-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button onClick={onBack} className="w-full rounded-md border border-ink/15 bg-white px-4 py-2.5 text-sm font-black hover:bg-ink/5 sm:w-auto">
          Volver al feed
        </button>
        <button
          onClick={generateCandidateSummary}
          disabled={summaryStatus === 'loading'}
          className="w-full rounded-md bg-signal px-4 py-2.5 text-sm font-black text-white transition hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-signal/50 sm:w-auto"
        >
          {summaryStatus === 'loading' ? 'Generando resumen...' : 'Resumen imparcial con IA'}
        </button>
      </div>

      {(summaryStatus === 'loading' || aiSummary) && (
        <section className={`mb-5 rounded-lg border p-4 shadow-panel ${summaryStatus === 'error' ? 'border-signal/25 bg-signal/5' : 'border-civic/20 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Resumen civico IA</p>
              <h2 className="mt-1 text-xl font-black">Lectura neutral del perfil</h2>
            </div>
            <span className="rounded-md bg-ballot px-2 py-1 text-xs font-black text-ink/55">Sin recomendacion de voto</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/75">
            {summaryStatus === 'loading' ? 'La IA esta leyendo biografia, propuestas y publicaciones disponibles...' : aiSummary}
          </p>
        </section>
      )}

      <section id="perfil" className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-panel">
        <div className="h-28 sm:h-36" style={{ backgroundColor: partyColor }} />
        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-col gap-3 sm:-mt-12">
            <div>
              {politician.photoUrl ? (
                <img className="h-24 w-24 rounded-lg border-4 border-white bg-white object-cover shadow-panel sm:h-28 sm:w-28" src={politician.photoUrl} alt={politician.name} />
              ) : (
                <div className="grid h-24 w-24 rounded-lg border-4 border-white text-2xl font-black text-white shadow-panel sm:h-28 sm:w-28" style={{ backgroundColor: partyColor }}>
                  <span className="place-self-center">{politician.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">{politician.name}</h1>
              <p className="mt-2 inline-flex rounded-md px-2 py-1 text-sm font-black text-white" style={{ backgroundColor: partyColor }}>{politician.party}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Cargo" value={politician.office} />
            <InfoRow label="Nivel" value={politician.level} />
            {politician.gender && <InfoRow label="Genero" value={politician.gender} />}
            <InfoRow label="Ubicacion" value={`${politician.municipality}, ${politician.state}`} />
            <InfoRow label="Actualizado" value={politician.updatedAt} />
          </div>

          <p className="mt-5 text-base leading-7 text-ink/72">{politician.profile}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {politician.topics.map((topic) => (
              <Tag key={topic}>{topic}</Tag>
            ))}
          </div>
          {politician.values?.length > 0 && (
            <div className="mt-5 rounded-lg bg-ballot p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Valores y principios</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {politician.values.map((value) => (
                  <span key={value} className="rounded-md bg-white px-3 py-2 text-sm font-black text-ink/70">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {isOwner && (
        <PoliticianAdminPanel
          politician={politician}
          onUpdateProfile={onUpdateProfile}
          onUpdateValues={onUpdateValues}
          onAddProposal={onAddProposal}
          onUpdateProposal={onUpdateProposal}
          onDeleteProposal={onDeleteProposal}
          onAddPost={onAddPost}
          onUpdatePost={onUpdatePost}
          onDeletePost={onDeletePost}
          parties={parties}
        />
      )}

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-signal">Publicaciones y propuestas</p>
        <div className="mt-4 space-y-3">
          {(politician.posts ?? []).length === 0 && <p className="rounded-lg bg-ballot p-4 text-sm font-bold text-ink/58">Aun no hay publicaciones.</p>}
          {(politician.posts ?? []).map((post, index) => (
            <article key={`${politician.id}-post-page-${index}`} className="relative rounded-lg border border-ink/10 p-4 pt-12">
              <ReportButton politicianId={politician.id} contentId={post.id || `publicacion-${index + 1}`} title={post.title || 'Publicacion'} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-civic/10 px-2 py-1 text-xs font-black text-civic">{post.type ?? 'Publicacion'}</span>
                {(post.tags ?? []).map((tag) => <Tag key={`${post.title}-${tag}`}>{tag}</Tag>)}
              </div>
              {post.title && <p className="mt-3 text-lg font-black">{post.title}</p>}
              <p className="mt-1 text-xs font-bold text-ink/45">{post.createdAt}</p>
              {post.imageUrl && (
                <button
                  type="button"
                  onClick={() => onOpenImage?.({ src: post.imageUrl, alt: post.title || 'Imagen de publicacion', title: post.title || 'Publicacion', subtitle: politician.name })}
                  className="group mt-3 block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-civic/30"
                  aria-label={`Abrir imagen de ${post.title || 'publicacion'} en pantalla completa`}
                >
                  <img className="max-h-96 w-full object-cover transition duration-200 group-hover:scale-[1.01] group-hover:opacity-90" src={post.imageUrl} alt={post.title || 'Imagen de publicacion'} />
                </button>
              )}
              <p className="mt-3 text-sm leading-6 text-ink/72">{post.body}</p>
              <ShareButton
                className="mt-3"
                politicianId={politician.id}
                contentId={post.id || `publicacion-${index + 1}`}
                title={`${post.title || 'Publicacion'} - ${politician.name}`}
                text={`${post.body}\n\n${politician.name} | ${politician.office} | ${politician.party}`}
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ImageViewer({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={image.title || 'Imagen de publicacion'}>
      <button className="absolute inset-0 cursor-zoom-out" type="button" aria-label="Cerrar imagen" onClick={onClose} />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-white/95 px-4 py-3 text-ink shadow-panel">
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{image.title || 'Imagen de publicacion'}</p>
            {image.subtitle && <p className="mt-0.5 truncate text-xs font-bold text-ink/55">{image.subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-md border border-ink/15 px-3 py-2 text-sm font-black transition hover:bg-ink hover:text-white">
            Cerrar
          </button>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-black/35">
          <img className="h-full w-full object-contain" src={image.src} alt={image.alt || image.title || 'Imagen de publicacion'} />
        </div>
      </div>
    </div>
  );
}

function ComparePage({ politicians, selectedPoliticians, selectedIds, onToggle, onOpenProfile }) {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [officeFilter, setOfficeFilter] = useState('Todos los cargos');
  const [topicFilter, setTopicFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [analysisQuestion, setAnalysisQuestion] = useState('Compara diferencias, similitudes e informacion faltante de estos dos perfiles.');

  const filteredPoliticians = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return politicians.filter((politician) => {
      const queryMatches = !normalizedQuery || getSearchText(politician, 'General').includes(normalizedQuery);
      const levelMatches = levelFilter === 'Todos' || politician.level === levelFilter;
      const officeMatches = officeFilter === 'Todos los cargos' || politician.office === officeFilter;
      const topicMatches = topicFilter === 'Todos' || politician.topics.includes(topicFilter);
      return queryMatches && levelMatches && officeMatches && topicMatches;
    });
  }, [politicians, query, levelFilter, officeFilter, topicFilter]);

  const selectForAnalysis = (id) => {
    onToggle(id);
  };

  const runAnalysis = async () => {
    if (selectedPoliticians.length !== 2) return;
    setAnalysisStatus('loading');
    setAnalysis('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: analysisQuestion, politicians: selectedPoliticians }),
      });
      const responseText = await response.text();
      let payload = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        payload = { error: responseText || 'El servidor no regreso una respuesta valida.' };
      }

      if (!response.ok) {
        throw new Error(payload.detail ? `${payload.error} ${payload.detail}` : payload.error ?? `Error ${response.status}`);
      }

      setAnalysis(payload.analysis);
      setAnalysisStatus('ready');
    } catch (error) {
      setAnalysis(error.message);
      setAnalysisStatus('error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 pb-24 sm:px-6 md:pb-5 lg:px-8">
      <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-signal">Comparacion IA</p>
            <h1 className="mt-2 text-3xl font-black">Selecciona dos candidatos para analizar</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">
              El analisis no declara ganadores. Solo organiza similitudes, diferencias, temas cubiertos e informacion faltante.
            </p>
          </div>
          <div className="rounded-lg bg-ink px-4 py-3 text-white">
            <p className="text-2xl font-black">{filteredPoliticians.length}</p>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-white/60">candidatos visibles</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_220px_180px]">
          <input
            className="h-11 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic sm:col-span-2 lg:col-span-1"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, ciudad, partido, cargo o propuesta"
          />
          <select className="h-11 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
            {levels.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="h-11 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic" value={officeFilter} onChange={(event) => setOfficeFilter(event.target.value)}>
            {offices.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="h-11 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic sm:col-span-2 lg:col-span-1" value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
            {topics.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="sticky top-16 z-20 mt-4 rounded-lg border border-ink/10 bg-ballot/95 p-3 shadow-panel backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
          {[0, 1].map((slot) => {
            const selected = selectedPoliticians[slot];
            return (
              <div key={slot} className="rounded-lg border border-ink/10 bg-white p-3">
                {selected ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{selected.name}</p>
                      <p className="mt-1 text-xs font-bold text-ink/50">{selected.office} · {selected.municipality}</p>
                    </div>
                    <button onClick={() => onToggle(selected.id)} className="rounded-md px-2 py-1 text-xs font-black text-signal hover:bg-signal/10">Quitar</button>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-ink/50">Selecciona candidato {slot + 1}</p>
                )}
              </div>
            );
          })}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={selectedPoliticians.length !== 2}
            className="h-11 w-full rounded-md bg-signal px-4 text-sm font-black text-white transition hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-signal/40 lg:w-auto"
          >
            Analizar con IA
          </button>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredPoliticians.map((politician) => (
          <CompareCandidateCard
            key={`compare-card-${politician.id}`}
            politician={politician}
            selected={selectedIds.includes(politician.id)}
            disabled={!selectedIds.includes(politician.id) && selectedIds.length >= 2}
            onSelect={() => selectForAnalysis(politician.id)}
            onOpen={() => onOpenProfile(politician.id)}
          />
        ))}
      </section>

      {isModalOpen && (
        <AnalysisModal
          selectedPoliticians={selectedPoliticians}
          question={analysisQuestion}
          setQuestion={setAnalysisQuestion}
          analysis={analysis}
          status={analysisStatus}
          onRun={runAnalysis}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function CompareCandidateCard({ politician, selected, disabled, onSelect, onOpen }) {
  const partyColor = getPartyColor(politician);

  return (
    <article className={`overflow-hidden rounded-lg border bg-white shadow-panel transition hover:-translate-y-0.5 hover:shadow-panel ${selected ? 'border-civic ring-2 ring-civic/20' : 'border-ink/10'} ${disabled ? 'opacity-50' : ''}`}>
      <div className="h-2" style={{ backgroundColor: partyColor }} />
      <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Tag>{politician.level}</Tag>
            <Tag>{politician.office}</Tag>
          </div>
          <h2 className="mt-3 text-xl font-black">{politician.name}</h2>
          <p className="mt-1 inline-flex rounded-md px-2 py-1 text-xs font-black text-white" style={{ backgroundColor: partyColor }}>{politician.party}</p>
          <p className="mt-1 text-xs font-bold text-ink/45">{politician.municipality}, {politician.state}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink/70">{politician.profile}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {politician.topics.slice(0, 3).map((topic) => <Tag key={topic}>{topic}</Tag>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onOpen} className="h-10 rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5 active:bg-ink/10">Ver perfil</button>
        <button
          onClick={onSelect}
          disabled={disabled}
          className={`h-10 rounded-md text-sm font-black transition ${selected ? 'bg-ink text-white' : 'bg-civic text-white hover:bg-civic/90'} disabled:cursor-not-allowed`}
        >
          {selected ? 'Seleccionado' : 'Seleccionar'}
        </button>
      </div>
      </div>
    </article>
  );
}

function AnalysisModal({ selectedPoliticians, question, setQuestion, analysis, status, onRun, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-signal">Analisis neutral IA</p>
            <h2 className="mt-2 text-2xl font-black">Comparacion de propuestas</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-ink/15 px-3 py-2 text-sm font-black hover:bg-ink/5">Cerrar</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {selectedPoliticians.map((politician) => (
            <div key={`modal-${politician.id}`} className="rounded-lg bg-ballot p-3">
              <p className="font-black">{politician.name}</p>
              <p className="mt-1 text-xs font-bold text-ink/50">{politician.office} · {politician.municipality}</p>
            </div>
          ))}
        </div>
        <textarea
          className="mt-4 min-h-24 w-full resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          onClick={onRun}
          disabled={selectedPoliticians.length !== 2 || status === 'loading'}
          className="mt-3 h-11 w-full rounded-md bg-signal text-sm font-black text-white transition hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-signal/50"
        >
          {status === 'loading' ? 'Generando analisis...' : 'Generar analisis neutral'}
        </button>
        <div className={`mt-4 rounded-lg border p-5 ${status === 'error' ? 'border-signal/25 bg-signal/10 text-signal' : 'border-ink/10 bg-white text-ink'}`}>
          <p className="text-sm font-black">{status === 'ready' ? 'Resultado' : 'Reglas'}</p>
          {analysis ? (
            <FormattedAiText text={analysis} isError={status === 'error'} />
          ) : (
            <p className="mt-2 text-sm leading-6 text-ink/60">
              La IA no recomienda candidatos ni declara ganadores. Solo compara coincidencias, diferencias e informacion faltante.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function FormattedAiText({ text, isError = false }) {
  const lines = String(text)
    .split('\n')
    .map((line) => line.trimEnd());

  return (
    <div className={`mt-3 space-y-3 text-sm leading-7 ${isError ? 'text-signal' : 'text-ink/78'}`}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`space-${index}`} className="h-1" />;
        }

        const headingMatch = trimmed.match(/^#{1,4}\s+(.*)$/);
        if (headingMatch) {
          return (
            <h3 key={`heading-${index}`} className="pt-2 text-base font-black text-ink">
              <FormattedInline text={headingMatch[1]} />
            </h3>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
        if (numberedMatch) {
          return (
            <h3 key={`numbered-${index}`} className="pt-2 text-base font-black text-ink">
              <span className="text-[#6A0DAD]">{numberedMatch[1]}</span> <FormattedInline text={numberedMatch[2]} />
            </h3>
          );
        }

        const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={`bullet-${index}`} className="flex gap-3">
              <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#6A0DAD]" />
              <p>
                <FormattedInline text={bulletMatch[1]} />
              </p>
            </div>
          );
        }

        if (trimmed.startsWith('|')) {
          return (
            <pre key={`table-${index}`} className="overflow-x-auto rounded-md bg-ballot px-3 py-2 text-xs text-ink/70">
              {trimmed}
            </pre>
          );
        }

        return (
          <p key={`paragraph-${index}`}>
            <FormattedInline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

function FormattedInline({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`bold-${index}`} className="font-black text-[#6A0DAD]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
}

function PoliticianAdminPanel({
  politician,
  onUpdateProfile,
  onUpdateValues,
  onAddProposal,
  onUpdateProposal,
  onDeleteProposal,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  parties = partyCatalog,
}) {
  const [profileDraft, setProfileDraft] = useState({
    name: politician.name,
    party: politician.party,
    profile: politician.profile,
    photoUrl: politician.photoUrl ?? '',
    source: politician.source,
  });
  const [valuesDraft, setValuesDraft] = useState((politician.values ?? []).join(', '));
  const [postDraft, setPostDraft] = useState({ title: '', body: '', type: 'Propuesta', topic: 'Salud', imageUrl: '' });
  const [savedMessage, setSavedMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoMessageType, setPhotoMessageType] = useState('success');
  const [postMessage, setPostMessage] = useState('');
  const [postMessageType, setPostMessageType] = useState('success');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [photoCameraOpen, setPhotoCameraOpen] = useState(false);
  const [postCameraOpen, setPostCameraOpen] = useState(false);

  const showSuccess = (message) => {
    setMessageType('success');
    setSavedMessage(message);
  };

  const showError = (message) => {
    setMessageType('error');
    setSavedMessage(message);
  };

  useEffect(() => {
    setProfileDraft({
      name: politician.name,
      party: politician.party,
      profile: politician.profile,
      photoUrl: politician.photoUrl ?? '',
      source: politician.source,
    });
    setValuesDraft((politician.values ?? []).join(', '));
    setSavedMessage('');
    setMessageType('success');
    setPhotoMessage('');
    setPhotoMessageType('success');
    setPostMessage('');
    setPostMessageType('success');
  }, [politician.id]);

  const saveProfile = (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    showSuccess('Guardando perfil...');
    Promise.resolve(onUpdateProfile(profileDraft))
      .then((savedProfile) => {
        setProfileDraft((draft) => ({ ...draft, ...savedProfile }));
        showSuccess('Perfil actualizado correctamente.');
      })
      .catch((error) => showError(error.message))
      .finally(() => setIsSavingProfile(false));
  };

  const saveValues = (event) => {
    event.preventDefault();
    const values = valuesDraft
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    onUpdateValues(values);
    showSuccess('Valores actualizados correctamente.');
  };

  const saveProfilePhoto = () => {
    setIsSavingPhoto(true);
    setPhotoMessageType('success');
    setPhotoMessage('Guardando foto en la base de datos...');
    Promise.resolve(onUpdateProfile(profileDraft))
      .then((savedProfile) => {
        setProfileDraft((draft) => ({ ...draft, ...savedProfile }));
        setPhotoMessageType('success');
        setPhotoMessage('Foto actualizada correctamente.');
        showSuccess('Foto actualizada correctamente.');
      })
      .catch((error) => {
        setPhotoMessageType('error');
        setPhotoMessage(error.message);
        showError(error.message);
      })
      .finally(() => setIsSavingPhoto(false));
  };

  const handlePhotoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoMessageType('error');
      setPhotoMessage('La foto pesa mas de 5 MB. Usa una imagen mas ligera.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextProfile = { ...profileDraft, photoUrl: reader.result };
      setProfileDraft(nextProfile);
      setPhotoMessageType('success');
      setPhotoMessage('Foto lista. Presiona "Guardar foto" para actualizarla en la base de datos.');
    };
    reader.onerror = () => {
      setPhotoMessageType('error');
      setPhotoMessage('No se pudo leer la foto seleccionada.');
    };
    reader.readAsDataURL(file);
  };

  const savePost = (event) => {
    event.preventDefault();
    if (!postDraft.body.trim()) {
      setPostMessageType('error');
      setPostMessage('La publicacion necesita contenido.');
      return;
    }
    setIsSavingPost(true);
    setPostMessageType('success');
    setPostMessage('Guardando publicacion en la base de datos...');
    const nextPost = {
      title: postDraft.title.trim(),
      body: postDraft.body.trim(),
      type: postDraft.type,
      tags: postDraft.topic === 'Sin tema' ? [] : [postDraft.topic],
      imageUrl: postDraft.imageUrl,
      createdAt: 'Ahora',
    };

    Promise.resolve(onAddPost(nextPost))
      .then(() => {
        setPostDraft({ title: '', body: '', type: 'Propuesta', topic: 'Salud', imageUrl: '' });
        setPostMessageType('success');
        setPostMessage('Publicacion guardada correctamente.');
        showSuccess('Publicacion guardada correctamente.');
      })
      .catch((error) => {
        setPostMessageType('error');
        setPostMessage(error.message);
        showError(error.message);
      })
      .finally(() => setIsSavingPost(false));
  };

  const handlePostImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPostMessageType('error');
      setPostMessage('La imagen pesa mas de 5 MB. Usa una imagen mas ligera.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPostDraft((draft) => ({ ...draft, imageUrl: reader.result }));
      setPostMessageType('success');
      setPostMessage('Imagen lista. Publica o guarda la publicacion para subirla a la base de datos.');
    };
    reader.onerror = () => {
      setPostMessageType('error');
      setPostMessage('No se pudo leer la imagen seleccionada.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="rounded-lg border border-civic/25 bg-white p-4 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Panel politico</p>
      <h2 className="mt-2 text-xl font-black">Administra tu perfil</h2>
      <p className="mt-2 text-sm leading-6 text-ink/62">
        Tus cambios se reflejan en esta sesion. Cuando el registro oficial este activo, se guardaran en tu cuenta verificada.
      </p>

      <form onSubmit={saveProfile} className="mt-4 space-y-3">
        <AdminInput label="Nombre publico" value={profileDraft.name} onChange={(value) => setProfileDraft((draft) => ({ ...draft, name: value }))} />
        <PartyDropdown value={profileDraft.party} parties={parties} onChange={(value) => setProfileDraft((draft) => ({ ...draft, party: value }))} />
        <div className="rounded-lg border border-ink/10 p-3 transition hover:border-civic/35 hover:shadow-panel">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Foto de perfil</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[96px_1fr]">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-ink">
              {profileDraft.photoUrl ? (
                <img className="h-full w-full object-cover" src={profileDraft.photoUrl} alt="Preview de perfil" />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm font-black text-white">Foto</div>
              )}
            </div>
            <div className="grid gap-2">
              <label className="group cursor-pointer rounded-lg border border-dashed border-civic/40 bg-civic/5 p-4 transition hover:-translate-y-0.5 hover:border-civic hover:bg-civic/10 hover:shadow-panel focus-within:ring-2 focus-within:ring-civic/25">
                <input className="sr-only" type="file" accept="image/*" onChange={handlePhotoFile} />
                <span className="block text-sm font-black text-civic">Subir foto desde mi dispositivo</span>
                <span className="mt-1 block text-xs font-bold leading-5 text-ink/55">JPG, PNG o WebP. Haz clic aqui para seleccionar un archivo.</span>
              </label>
              <button type="button" onClick={() => setPhotoCameraOpen(true)} className="group cursor-pointer rounded-lg border border-ink/15 bg-ink p-4 text-left text-white transition hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-panel focus:outline-none focus:ring-2 focus:ring-ink/20">
                <span className="block text-sm font-black">Tomar foto ahora</span>
                <span className="mt-1 block text-xs font-bold leading-5 text-white/60">Abre la camara frontal del dispositivo.</span>
              </button>
            </div>
          </div>
          <div className="mt-3">
            <AdminInput label="O pega una URL de foto" value={profileDraft.photoUrl} onChange={(value) => setProfileDraft((draft) => ({ ...draft, photoUrl: value }))} />
          </div>
          <button
            type="button"
            onClick={saveProfilePhoto}
            disabled={isSavingPhoto}
            className="mt-3 h-10 w-full rounded-md bg-civic text-sm font-black text-white transition hover:bg-civic/90 disabled:cursor-wait disabled:opacity-60"
          >
            {isSavingPhoto ? 'Guardando foto...' : 'Guardar foto'}
          </button>
          {photoMessage && (
            <p className={`mt-3 rounded-md p-3 text-sm font-black ${photoMessageType === 'error' ? 'bg-signal/10 text-signal' : 'bg-civic/10 text-civic'}`}>
              {photoMessage}
            </p>
          )}
        </div>
        <AdminInput label="Fuente oficial" value={profileDraft.source} onChange={(value) => setProfileDraft((draft) => ({ ...draft, source: value }))} />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Biografia</span>
          <textarea
            className="mt-2 min-h-24 w-full resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
            value={profileDraft.profile}
            onChange={(event) => setProfileDraft((draft) => ({ ...draft, profile: event.target.value }))}
          />
        </label>
        <button disabled={isSavingProfile} className="h-10 w-full rounded-md bg-ink text-sm font-black text-white hover:bg-ink/90 disabled:cursor-wait disabled:opacity-60">
          {isSavingProfile ? 'Guardando perfil...' : 'Guardar perfil'}
        </button>
      </form>

      <form onSubmit={saveValues} className="mt-5 border-t border-ink/10 pt-4">
        <p className="text-sm font-black">Valores y principios</p>
        <p className="mt-1 text-xs font-bold leading-5 text-ink/50">Separalos con comas. Ejemplo: transparencia, seguridad, derechos humanos.</p>
        <textarea
          className="mt-3 min-h-20 w-full resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
          value={valuesDraft}
          onChange={(event) => setValuesDraft(event.target.value)}
        />
        <button className="mt-3 h-10 w-full rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5">
          Guardar valores
        </button>
      </form>

      <form onSubmit={savePost} className="mt-5 border-t border-ink/10 pt-4">
        <p className="text-sm font-black">Crear publicacion con tags</p>
        <p className="mt-1 text-xs font-bold leading-5 text-ink/50">
          Usa tags como Salud, Seguridad o Agua para agrupar propuestas y publicaciones por materia.
        </p>
        <div className="mt-3 grid gap-3">
          <select
            className="h-10 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-black outline-none focus:border-civic"
            value={postDraft.type}
            onChange={(event) => setPostDraft((draft) => ({ ...draft, type: event.target.value }))}
          >
            <option>Propuesta</option>
            <option>Actualizacion</option>
            <option>Evento</option>
            <option>Aclaracion</option>
          </select>
          <input
            className="h-10 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
            value={postDraft.title}
            onChange={(event) => setPostDraft((draft) => ({ ...draft, title: event.target.value }))}
            placeholder="Titulo opcional"
          />
          <textarea
            className="min-h-24 resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
            value={postDraft.body}
            onChange={(event) => setPostDraft((draft) => ({ ...draft, body: event.target.value }))}
            placeholder="Escribe una propuesta, actualizacion o posicionamiento."
          />
          <TopicDropdown value={postDraft.topic} onChange={(topic) => setPostDraft((draft) => ({ ...draft, topic }))} />
          <div className="rounded-lg border border-ink/10 p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Imagen de la publicacion</p>
            {postDraft.imageUrl && (
              <img className="mt-3 max-h-56 w-full rounded-lg object-cover" src={postDraft.imageUrl} alt="Preview de publicacion" />
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="cursor-pointer rounded-lg border border-dashed border-civic/40 bg-civic/5 p-3 transition hover:-translate-y-0.5 hover:border-civic hover:bg-civic/10 hover:shadow-panel">
                <input className="sr-only" type="file" accept="image/*" onChange={handlePostImageFile} />
                <span className="block text-sm font-black text-civic">Subir imagen</span>
                <span className="mt-1 block text-xs font-bold text-ink/50">Desde tu dispositivo</span>
              </label>
              <button type="button" onClick={() => setPostCameraOpen(true)} className="cursor-pointer rounded-lg border border-ink/15 bg-ink p-3 text-left text-white transition hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-panel">
                <span className="block text-sm font-black">Tomar foto</span>
                <span className="mt-1 block text-xs font-bold text-white/60">Camara del dispositivo</span>
              </button>
            </div>
            <input
              className="mt-3 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
              value={postDraft.imageUrl}
              onChange={(event) => setPostDraft((draft) => ({ ...draft, imageUrl: event.target.value }))}
              placeholder="O pega una URL de imagen"
            />
          </div>
        </div>
        {postMessage && (
          <p className={`mt-3 rounded-md p-3 text-sm font-black ${postMessageType === 'error' ? 'bg-signal/10 text-signal' : 'bg-civic/10 text-civic'}`}>
            {postMessage}
          </p>
        )}
        <button disabled={isSavingPost} className="mt-3 h-10 w-full rounded-md bg-civic text-sm font-black text-white hover:bg-civic/90 disabled:cursor-wait disabled:opacity-60">
          {isSavingPost ? 'Publicando...' : 'Publicar'}
        </button>
      </form>

      <div className="mt-5 border-t border-ink/10 pt-4">
        <p className="text-sm font-black">Propuestas anteriores</p>
        <p className="mt-1 text-xs font-bold leading-5 text-ink/50">Esta seccion existe por compatibilidad con datos previos. Las nuevas propuestas se crean como publicaciones con tags.</p>
        <div className="mt-3 space-y-3">
          {politician.proposals.map((proposal, index) => (
            <EditableProposal
              key={`${politician.id}-editable-proposal-${index}`}
              proposal={proposal}
              onSave={(nextProposal) => {
                onUpdateProposal(index, nextProposal);
                showSuccess('Propuesta actualizada correctamente.');
              }}
              onDelete={() => {
                onDeleteProposal(index);
                showSuccess('Propuesta eliminada correctamente.');
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-ink/10 pt-4">
        <p className="text-sm font-black">Editar publicaciones existentes</p>
        <div className="mt-3 space-y-3">
          {(politician.posts ?? []).length === 0 && <p className="rounded-md bg-ballot p-3 text-sm font-bold text-ink/55">Todavia no tienes publicaciones.</p>}
          {(politician.posts ?? []).map((post, index) => (
            <EditablePost
              key={`${politician.id}-editable-post-${index}`}
              post={post}
              onSave={(nextPost) => {
                Promise.resolve(onUpdatePost(index, nextPost))
                  .then(() => showSuccess('Publicacion actualizada correctamente.'))
                  .catch((error) => showError(error.message));
              }}
              onDelete={() => {
                Promise.resolve(onDeletePost(index))
                  .then(() => showSuccess('Publicacion eliminada correctamente.'))
                  .catch((error) => showError(error.message));
              }}
            />
          ))}
        </div>
      </div>

      {savedMessage && (
        <p className={`mt-4 rounded-md p-3 text-sm font-black ${messageType === 'error' ? 'bg-signal/10 text-signal' : 'bg-civic/10 text-civic'}`}>
          {savedMessage}
        </p>
      )}
      {photoCameraOpen && (
        <CameraCaptureModal
          title="Tomar foto de perfil"
          facingMode="user"
          onClose={() => setPhotoCameraOpen(false)}
          onCapture={(dataUrl) => {
            setProfileDraft((draft) => ({ ...draft, photoUrl: dataUrl }));
            setPhotoMessageType('success');
            setPhotoMessage('Foto tomada. Presiona "Guardar foto" para actualizarla en la base de datos.');
            setPhotoCameraOpen(false);
          }}
        />
      )}
      {postCameraOpen && (
        <CameraCaptureModal
          title="Tomar foto para publicacion"
          facingMode="environment"
          onClose={() => setPostCameraOpen(false)}
          onCapture={(dataUrl) => {
            setPostDraft((draft) => ({ ...draft, imageUrl: dataUrl }));
            setPostMessageType('success');
            setPostMessage('Foto tomada. Publica o guarda la publicacion para subirla a la base de datos.');
            setPostCameraOpen(false);
          }}
        />
      )}
    </section>
  );
}

function AdminInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">{label}</span>
      <input
        className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TopicDropdown({ value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Tema de la publicacion</span>
      <select
        className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-black outline-none focus:border-civic"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {publicationTopicOptions.map((topic) => (
          <option key={topic}>{topic}</option>
        ))}
      </select>
    </label>
  );
}

function PartyDropdown({ value, parties, onChange }) {
  const selectedParty = parties.find((party) => normalizeText(party.name) === normalizeText(value));

  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Partido</span>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_120px]">
        <select
          className="h-10 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-black outline-none focus:border-civic"
          value={selectedParty?.name ?? value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Selecciona un partido</option>
          {parties.map((party) => (
            <option key={`${party.name}-${party.color}`} value={party.name}>
              {party.name}{party.shortName ? ` (${party.shortName})` : ''}
            </option>
          ))}
        </select>
        <div className="flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-ballot px-3">
          <span className="h-5 w-5 rounded-full border border-ink/10" style={{ backgroundColor: selectedParty?.color ?? getPartyColor({ party: value }) }} />
          <span className="text-xs font-black text-ink/55">Banner</span>
        </div>
      </div>
    </label>
  );
}

function EditableProposal({ proposal, onSave, onDelete }) {
  const [draft, setDraft] = useState(proposal);

  useEffect(() => {
    setDraft(proposal);
  }, [proposal]);

  return (
    <div className="rounded-lg border border-ink/10 p-3">
      <select
        className="h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-black outline-none focus:border-civic"
        value={draft.topic}
        onChange={(event) => setDraft((current) => ({ ...current, topic: event.target.value }))}
      >
        {editableTopics.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <textarea
        className="mt-2 min-h-24 w-full resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
        value={draft.text}
        onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))}
      />
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => onSave(draft)} className="h-9 flex-1 rounded-md bg-ink text-xs font-black text-white hover:bg-ink/90">
          Guardar
        </button>
        <button type="button" onClick={onDelete} className="h-9 rounded-md border border-signal/30 px-3 text-xs font-black text-signal hover:bg-signal/5">
          Eliminar
        </button>
      </div>
    </div>
  );
}

function EditablePost({ post, onSave, onDelete }) {
  const [draft, setDraft] = useState({ ...post, topic: post.tags?.[0] ?? 'Sin tema' });
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    setDraft({ ...post, topic: post.tags?.[0] ?? 'Sin tema' });
  }, [post]);

  const saveDraft = () => {
    if (!draft.body?.trim()) return;
    const { topic, ...rest } = draft;
    onSave({ ...rest, tags: topic === 'Sin tema' ? [] : [topic] });
  };

  const handleImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-lg border border-ink/10 p-3">
      <select
        className="h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-black outline-none focus:border-civic"
        value={draft.type ?? 'Publicacion'}
        onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
      >
        <option>Propuesta</option>
        <option>Actualizacion</option>
        <option>Evento</option>
        <option>Aclaracion</option>
      </select>
      <input
        className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
        value={draft.title ?? ''}
        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        placeholder="Titulo opcional"
      />
      <textarea
        className="mt-2 min-h-24 w-full resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
        value={draft.body}
        onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
      />
      <div className="mt-2">
        <TopicDropdown value={draft.topic} onChange={(topic) => setDraft((current) => ({ ...current, topic }))} />
      </div>
      <div className="mt-2 rounded-lg border border-ink/10 p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Imagen</p>
        {draft.imageUrl && <img className="mt-2 max-h-44 w-full rounded-md object-cover" src={draft.imageUrl} alt={draft.title || 'Imagen de publicacion'} />}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="cursor-pointer rounded-md bg-civic/10 px-3 py-2 text-xs font-black text-civic hover:bg-civic/20">
            <input className="sr-only" type="file" accept="image/*" onChange={handleImageFile} />
            Cambiar imagen
          </label>
          <button type="button" onClick={() => setCameraOpen(true)} className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black hover:bg-ink/5">
            Tomar foto
          </button>
          <button type="button" onClick={() => setDraft((current) => ({ ...current, imageUrl: '' }))} className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black hover:bg-ink/5 sm:col-span-2">
            Quitar imagen
          </button>
        </div>
        <input
          className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
          value={draft.imageUrl ?? ''}
          onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
          placeholder="URL de imagen"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={saveDraft} className="h-9 flex-1 rounded-md bg-ink text-xs font-black text-white hover:bg-ink/90">
          Guardar
        </button>
        <button type="button" onClick={onDelete} className="h-9 rounded-md border border-signal/30 px-3 text-xs font-black text-signal hover:bg-signal/5">
          Eliminar
        </button>
      </div>
      {cameraOpen && (
        <CameraCaptureModal
          title="Tomar foto para publicacion"
          facingMode="environment"
          onClose={() => setCameraOpen(false)}
          onCapture={(dataUrl) => {
            setDraft((current) => ({ ...current, imageUrl: dataUrl }));
            setCameraOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CameraCaptureModal({ title, facingMode = 'environment', onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Este navegador no permite abrir la camara desde la app.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError('No se pudo abrir la camara. Revisa permisos del navegador o usa subir imagen.');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.88));
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-white p-4 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Camara</p>
            <h2 className="mt-1 text-xl font-black">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5" aria-label="Cerrar camara">
            x
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl bg-ink">
          {error ? (
            <p className="p-5 text-sm font-bold leading-6 text-white">{error}</p>
          ) : (
            <video ref={videoRef} className="max-h-[60vh] w-full object-cover" playsInline muted />
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={capture} disabled={Boolean(error)} className="h-11 rounded-md bg-civic text-sm font-black text-white hover:bg-civic/90 disabled:cursor-not-allowed disabled:opacity-50">
            Usar esta foto
          </button>
          <button type="button" onClick={onClose} className="h-11 rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5">
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}

function CivicChatbot({ location }) {
  const [message, setMessage] = useState('');
  const [chatStatus, setChatStatus] = useState('idle');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Preguntame sobre candidaturas y propuestas en la base. Por ejemplo: "Quienes tienen propuestas sobre salud o vacunas gratuitas en Chihuahua?"',
      sources: [],
    },
  ]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setMessages((current) => [...current, { role: 'user', text: userMessage, sources: [] }]);
    setChatStatus('loading');

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            state: location.state,
            municipality: location.municipality,
          },
        }),
      });
      const responseText = await response.text();
      let payload = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        payload = { error: responseText || 'El servidor no regreso una respuesta valida.' };
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'No se pudo responder la pregunta civica en este momento.');
      }

      if (!payload.answer) {
        throw new Error('No se pudo mostrar una respuesta en este momento.');
      }

      setMessages((current) => [...current, { role: 'assistant', text: payload.answer, sources: payload.sources ?? [] }]);
      setChatStatus('idle');
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: error.message, sources: [] }]);
      setChatStatus('error');
    }
  };

  const quickPrompts = [
    'Hay algun candidato llamado Fernando Navarro?',
    'Quienes hablan de salud en Chihuahua?',
    `Que candidaturas hay en ${location.municipality}?`,
  ];

  return (
    <section id="asistente" className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-panel">
      <div className="border-b border-ink/10 bg-ink p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-civic text-sm font-black text-white shadow-lg shadow-civic/20">
              IA
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/50">Asistente civico</p>
              <h2 className="mt-1 text-xl font-black">Pregunta sobre candidaturas</h2>
            </div>
          </div>
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-black text-white/70">{location.state}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Responde con informacion disponible en la base. No recomienda votos ni declara ganadores.
        </p>
      </div>

      <div className="bg-gradient-to-b from-ballot/70 to-white px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessage(prompt)}
              className="shrink-0 rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-black text-ink/62 transition hover:-translate-y-0.5 hover:border-civic/35 hover:text-civic hover:shadow-panel"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 bg-white px-4 py-5">
        {messages.map((item, index) => (
          <div key={`${item.role}-${index}`} className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm transition ${item.role === 'user' ? 'ml-auto rounded-br-md bg-civic text-white' : 'mr-auto rounded-bl-md border border-ink/10 bg-ballot text-ink'}`}>
            <p className="whitespace-pre-wrap text-sm leading-6">{item.text}</p>
            {item.sources?.length > 0 && (
              <div className="mt-3 border-t border-ink/10 pt-2">
                <p className="text-xs font-black uppercase tracking-[0.12em] opacity-60">Fuentes usadas</p>
                <div className="mt-2 space-y-1">
                  {item.sources.slice(0, 5).map((source) => (
                    <p key={source.id} className="text-xs font-bold opacity-75">
                      {source.name} · {source.office} · {source.municipality}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {chatStatus === 'loading' && <TypingBubble />}
      </div>

      <form onSubmit={sendMessage} className="border-t border-ink/10 bg-ballot p-4">
        <div className="rounded-lg border border-ink/10 bg-white p-2 shadow-sm transition focus-within:border-civic/50 focus-within:ring-2 focus-within:ring-civic/10">
          <textarea
            className="min-h-20 w-full resize-none rounded-md bg-white p-2 text-sm leading-6 outline-none placeholder:text-ink/35"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribe una pregunta sobre candidaturas, propuestas, temas o ciudades..."
          />
          <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-2">
            <p className="hidden text-xs font-bold text-ink/45 sm:block">Usa lenguaje natural. Ej. "quienes hablan de salud"</p>
            <button
              disabled={chatStatus === 'loading' || !message.trim()}
              className="h-10 shrink-0 rounded-md bg-signal px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-signal/90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-signal/45"
            >
              {chatStatus === 'loading' ? 'Enviando' : 'Enviar'}
            </button>
          </div>
        </div>
      </form>

    </section>
  );
}

function TypingBubble() {
  return (
    <div className="mr-auto flex max-w-[82%] items-center gap-3 rounded-2xl rounded-bl-md border border-ink/10 bg-ballot px-4 py-3 shadow-sm">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-xs font-black text-white">IA</div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-civic [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-civic [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-civic" />
        <span className="ml-2 text-xs font-black text-ink/45">Buscando informacion disponible</span>
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-8 text-center shadow-panel">
      <p className="text-xl font-black">No encontramos perfiles con esos filtros.</p>
      <p className="mt-2 text-sm leading-6 text-ink/65">Prueba con otro cargo, tema o nivel de gobierno.</p>
      <button onClick={onReset} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-black text-white transition hover:bg-ink/90">
        Limpiar filtros
      </button>
    </section>
  );
}

function Rule({ text }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-civic" />
      <span>{text}</span>
    </div>
  );
}

function Tag({ children }) {
  return <span className="rounded-md bg-ink/5 px-2 py-1 text-xs font-black text-ink/65">{children}</span>;
}

function ShareButton({ politicianId, contentId, title, text, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-xs font-black text-ink/70 transition hover:-translate-y-0.5 hover:border-civic/30 hover:text-civic hover:shadow-panel"
        aria-label="Compartir publicacion"
      >
        <ShareIcon />
        Compartir
      </button>
      {isOpen && (
        <ShareModal
          politicianId={politicianId}
          contentId={contentId}
          title={title}
          text={text}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function ShareModal({ politicianId, contentId, title, text, onClose }) {
  const [copied, setCopied] = useState('');
  const shareUrl = buildShareUrl(politicianId, contentId);
  const shareText = `${title}\n\n${text}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTextWithUrl = encodeURIComponent(`${shareText}\n\n${shareUrl}`);

  const copyValue = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('No se pudo copiar');
      window.setTimeout(() => setCopied(''), 1800);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyValue(`${shareText}\n\n${shareUrl}`, 'Texto copiado');
      return;
    }

    try {
      await navigator.share({ title, text, url: shareUrl });
    } catch {
      // La persona puede cerrar el dialogo de compartir; no es un error de la app.
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-3 backdrop-blur-sm sm:p-4">
      <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-ink/10 bg-white p-4 shadow-panel sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Compartir</p>
            <h2 className="mt-1 text-2xl font-black">Vista previa</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5" aria-label="Cerrar compartir">
            x
          </button>
        </div>
        <div className="mt-4 rounded-lg border border-ink/10 bg-ballot p-4">
          <p className="text-sm font-black">{title}</p>
          <p className="mt-2 line-clamp-4 text-sm leading-6 text-ink/65">{text}</p>
          <p className="mt-3 truncate text-xs font-bold text-civic">{shareUrl}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button onClick={nativeShare} className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg bg-ink text-xs font-black text-white transition hover:-translate-y-0.5 hover:shadow-panel active:scale-95 sm:h-20">
            <ShareIcon />
            Sistema
          </button>
        <a
          className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-ink/15 text-xs font-black transition hover:-translate-y-0.5 hover:bg-ink/5 hover:shadow-panel sm:h-20"
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-lg">X</span>
          X
        </a>
        <a
          className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-ink/15 text-xs font-black transition hover:-translate-y-0.5 hover:bg-ink/5 hover:shadow-panel sm:h-20"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1877F2] text-white">f</span>
          Facebook
        </a>
        <a
          className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-ink/15 text-xs font-black transition hover:-translate-y-0.5 hover:bg-ink/5 hover:shadow-panel sm:h-20"
          href={`https://wa.me/?text=${encodedTextWithUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#25D366] text-white">W</span>
          WhatsApp
        </a>
        <button
          onClick={() => copyValue(`${shareText}\n\n${shareUrl}`, 'Texto copiado para Instagram')}
          className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-ink/15 text-xs font-black transition hover:-translate-y-0.5 hover:bg-ink/5 hover:shadow-panel sm:h-20"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white">◎</span>
          Instagram
        </button>
        <button
          onClick={() => copyValue(shareUrl, 'URL copiada')}
          className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-ink/15 text-xs font-black transition hover:-translate-y-0.5 hover:bg-ink/5 hover:shadow-panel sm:h-20"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-civic text-white">↗</span>
          Copiar URL
        </button>
        </div>
        {copied && <p className="mt-3 rounded-md bg-civic/10 p-3 text-sm font-black text-civic">{copied}</p>}
      </section>
    </div>
  );
}

function ReportButton({ politicianId, contentId, title }) {
  const [status, setStatus] = useState('idle');

  const reportContent = async () => {
    if (status === 'sent') return;
    setStatus('loading');
    try {
      const response = await fetchWithTimeout(getApiUrl('/api/reports'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ politicianId, contentId, title, reason: 'Reporte ciudadano desde la publicacion' }),
      }, 6000);
      await parseApiPayload(response);
      setStatus('sent');
    } catch {
      setStatus('sent');
    }
  };

  return (
    <button
      type="button"
      onClick={reportContent}
      className={`absolute right-4 top-4 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-black transition ${
        status === 'sent'
          ? 'border-civic/20 bg-civic/10 text-civic'
          : 'border-ink/10 bg-ballot text-ink/55 hover:border-signal/30 hover:text-signal'
      }`}
      title="Reportar publicacion"
      aria-label="Reportar publicacion"
    >
      <FlagIcon />
      {status === 'loading' ? 'Enviando' : status === 'sent' ? 'Reportado' : 'Reportar'}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21V4" />
      <path d="M5 4h12l-2 5 2 5H5" />
    </svg>
  );
}

function getInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function mapSupabasePolitician(row) {
  const proposals = Array.isArray(row.proposals) ? row.proposals : [];
  const topics = Array.isArray(row.topics) ? row.topics.filter(Boolean) : [];
  const posts = Array.isArray(row.posts) ? row.posts : [];

  return {
    id: String(row.id),
    governmentId: row.government_politician_id ?? '',
    gender: row.gender ?? '',
    name: row.name ?? 'Perfil sin nombre',
    party: row.party ?? 'Sin partido',
    partyColor: row.party_color_hex ?? '',
    office: row.office ?? 'Cargo no definido',
    level: row.level ?? 'Federal',
    state: row.state ?? '',
    municipality: row.municipality ?? 'Todo el estado',
    federalDistrict: row.federal_district ?? 'No aplica',
    localDistrict: row.local_district ?? 'No aplica',
    topics,
    profile: row.profile || 'Este perfil politico todavia no tiene una biografia publicada.',
    photoUrl: row.photo_url ?? '',
    proposals: proposals.map((proposal) => ({
      topic: proposal.topic ?? 'General',
      text: proposal.text ?? '',
    })),
    posts: posts.map((post) => ({
      id: post.id ?? '',
      title: post.title ?? '',
      body: post.body ?? '',
      type: post.type ?? 'Publicacion',
      tags: Array.isArray(post.tags) ? post.tags : [],
      imageUrl: post.imageUrl ?? '',
      createdAt: post.createdAt ?? '',
      createdAtIso: post.createdAtIso ?? '',
    })),
    source: row.source || 'Fuente oficial pendiente',
    updatedAt: row.updated_at ?? 'Sin fecha',
  };
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getPostTime(post, politician) {
  const value = post?.createdAtIso || post?.createdAt || politician?.updatedAt;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getPartyColor(politician) {
  if (isHexColor(politician?.partyColor)) return politician.partyColor;

  const normalizedParty = normalizeText(politician?.party);
  const catalogMatch = partyCatalog.find((party) => normalizeText(party.name) === normalizedParty || normalizeText(party.shortName) === normalizedParty);
  if (catalogMatch) return catalogMatch.color;
  if (normalizedParty.includes('intuicion') || normalizedParty.includes('morado')) return '#6A0DAD';
  if (normalizedParty.includes('amor eterno') || normalizedParty.includes('azul')) return '#1E90FF';
  if (normalizedParty.includes("partidon't") || normalizedParty.includes('verde')) return '#89CC04';
  if (normalizedParty.includes('coquette') || normalizedParty.includes('rosa')) return '#FFB7C5';
  if (normalizedParty.includes('salvando') || normalizedParty.includes('rojo')) return '#DC143C';
  if (normalizedParty.includes('malaventurada') || normalizedParty.includes('negro')) return '#0A0A0F';

  return '#0A0A0F';
}

function mergeParties(parties) {
  const merged = new Map();
  [...partyCatalog, ...(parties ?? [])].forEach((party) => {
    if (!party?.name) return;
    const key = normalizeText(party.name);
    merged.set(key, {
      id: party.id ?? merged.get(key)?.id,
      name: party.name,
      shortName: party.shortName ?? party.short_name ?? '',
      color: party.color ?? party.color_hex ?? getPartyColor({ party: party.name }),
      description: party.description ?? '',
    });
  });
  return Array.from(merged.values());
}

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value ?? '').trim());
}

function parseTags(value) {
  return Array.from(
    new Set(
      String(value ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

async function parseApiPayload(response) {
  const responseText = await response.text();
  let payload = {};
  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = { error: responseText || 'El servidor no regreso una respuesta valida.' };
  }

  if (!response.ok) {
    throw new Error(payload.error ?? `Error ${response.status}`);
  }

  return payload;
}

function getApiUrl(path) {
  const normalizedBaseUrl = String(apiBaseUrl || '').replace(/\/+$/, '');

  if (!normalizedBaseUrl && !import.meta.env.DEV) {
    throw new Error('No esta configurada VITE_API_BASE_URL para conectar con el backend.');
  }

  return `${normalizedBaseUrl}${path}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`El servidor tardo demasiado en responder: ${getUrlOrigin(url)}.`);
    }
    throw new Error(`No se pudo conectar con el backend en ${getUrlOrigin(url)}. Revisa que la API este desplegada y que VITE_API_BASE_URL sea correcta.`);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getUrlOrigin(url) {
  try {
    return new URL(url, window.location.origin).origin;
  } catch {
    return String(url);
  }
}

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();

  const existingScript = document.querySelector('script[data-google-maps="true"]');
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });
}

function buildMockDistrictPolygon(center, location = {}) {
  const hasSection = Boolean(location.electoralSection);
  const isUrbanSplit = ['Chihuahua', 'Juarez'].includes(location.municipality);
  const latSize = hasSection ? (isUrbanSplit ? 0.055 : 0.32) : 0.035;
  const lngSize = hasSection ? (isUrbanSplit ? 0.07 : 0.42) : 0.045;

  return [
    { lat: center.lat + latSize, lng: center.lng - lngSize },
    { lat: center.lat + latSize * 0.75, lng: center.lng + lngSize },
    { lat: center.lat - latSize * 0.8, lng: center.lng + lngSize * 0.8 },
    { lat: center.lat - latSize, lng: center.lng - lngSize * 0.75 },
  ];
}

function isDemoDistrict(value) {
  return normalizeText(value).includes('demo');
}

function buildShareUrl(politicianId, contentId) {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.href);
  url.searchParams.set('perfil', politicianId);
  if (contentId) {
    url.searchParams.set('contenido', contentId);
  } else {
    url.searchParams.delete('contenido');
  }
  url.hash = '';
  return url.toString();
}

function getSearchText(politician, scope) {
  const fieldsByScope = {
    Nombre: [politician.name],
    Ciudad: [politician.municipality, politician.state],
    Cargo: [politician.office, politician.level, politician.federalDistrict, politician.localDistrict],
    Partido: [politician.party],
    Tema: [...politician.topics, ...(politician.posts ?? []).flatMap((post) => post.tags ?? [])],
    General: [
      politician.name,
      politician.municipality,
      politician.state,
      politician.office,
      politician.level,
      politician.party,
      politician.federalDistrict,
      politician.localDistrict,
      politician.profile,
      ...politician.topics,
      ...politician.proposals.map((proposal) => `${proposal.topic} ${proposal.text}`),
      ...(politician.posts ?? []).map((post) => `${post.title} ${post.body} ${(post.tags ?? []).join(' ')}`),
    ],
  };

  return normalizeText((fieldsByScope[scope] ?? fieldsByScope.General).join(' '));
}

function InfoRow({ label, value, light = false }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${light ? 'py-1 text-white' : ''}`}>
      <span className={light ? 'text-white/55' : 'text-ink/48'}>{label}</span>
      <span className={`text-right font-black ${light ? 'text-white' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

export default App;
