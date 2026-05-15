import React, { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { chihuahuaLocalDistricts } from './data/chihuahuaDistricts';

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
const offices = ['Todos los cargos', 'Gubernatura', 'Senaduria', 'Diputacion federal', 'Diputacion local', 'Presidencia municipal', 'Regiduria', 'Magistratura'];
const topics = ['Todos', 'Seguridad', 'Economia', 'Salud', 'Movilidad', 'Derechos humanos', 'Agua', 'Transparencia'];
const editableTopics = ['Seguridad', 'Economia', 'Salud', 'Movilidad', 'Derechos humanos', 'Agua', 'Transparencia', 'Educacion', 'Juventudes', 'Servicios publicos'];

function App() {
  const [politicians, setPoliticians] = useState(mockPoliticians);
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
      setSelectedIds(nextPoliticians.slice(0, 2).map((politician) => politician.id));
      setDataStatus('Supabase conectado');
    }

    loadPoliticians();

    return () => {
      cancelled = true;
    };
  }, []);

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
        !location.electoralSection ||
        politician.level !== 'Federal' ||
        politician.office !== 'Diputacion federal' ||
        isDemoDistrict(politician.federalDistrict) ||
        politician.federalDistrict === location.federalDistrict ||
        politician.federalDistrict === 'Circunscripcion estatal';
      const sameLocalDistrict =
        !location.electoralSection ||
        politician.level !== 'Estatal' ||
        isDemoDistrict(politician.localDistrict) ||
        politician.localDistrict === location.localDistrict ||
        politician.localDistrict === 'Todo el estado' ||
        politician.localDistrict === 'Circuito judicial estatal';
      const levelMatches = level === 'Todos' || politician.level === level;
      const officeMatches = office === 'Todos los cargos' || politician.office === office;
      const topicMatches = topic === 'Todos' || politician.topics.includes(topic);
      const searchMatches = !normalizedSearch || getSearchText(politician, searchScope).includes(normalizedSearch);

      return sameState && sameMunicipality && sameFederalDistrict && sameLocalDistrict && levelMatches && officeMatches && topicMatches && searchMatches;
    });
  }, [location, level, office, topic, politicians, searchQuery, searchScope]);

  const activePolitician = politicians.find((politician) => politician.id === activeId) ?? visiblePoliticians[0] ?? politicians[0];
  const selectedPoliticians = politicians.filter((politician) => selectedIds.includes(politician.id));

  const toggleCompare = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id].slice(-2);
    });
  };

  const selectLocation = (label) => {
    const nextLocation = locationPresets.find((preset) => preset.label === label) ?? locationPresets[0];
    setLocation(nextLocation);
    setSectionError('');
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
  };

  const updatePoliticianProfile = (id, updates) => {
    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              ...updates,
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
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

  const addPoliticianPost = (id, post) => {
    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              topics: Array.from(new Set([...politician.topics, ...(post.tags ?? [])])),
              posts: [post, ...(politician.posts ?? [])],
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
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

  const updatePoliticianPost = (id, postIndex, post) => {
    setPoliticians((current) =>
      current.map((politician) =>
        politician.id === id
          ? {
              ...politician,
              posts: (politician.posts ?? []).map((item, index) => (index === postIndex ? { ...item, ...post } : item)),
              topics: Array.from(new Set([...(politician.topics ?? []), ...(post.tags ?? [])])),
              updatedAt: 'Actualizado ahora',
            }
          : politician,
      ),
    );
  };

  const deletePoliticianPost = (id, postIndex) => {
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
          onReset={() => setEntryMode(null)}
          activePolitician={activePolitician}
          onFeed={() => setView('feed')}
          onProfile={() => {
            if (ownerId) setActiveId(ownerId);
            setView('profile');
          }}
          onCompare={() => setView('compare')}
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
        />
      </main>
    );
  }

  if (view === 'compare') {
    return (
      <main className="min-h-screen bg-ballot text-ink">
        <Header
          entryMode={entryMode}
          onReset={() => setEntryMode(null)}
          activePolitician={activePolitician}
          onFeed={() => setView('feed')}
          onProfile={() => {
            if (ownerId) setActiveId(ownerId);
            setView('profile');
          }}
          onCompare={() => setView('compare')}
        />
        <ComparePage
          politicians={politicians}
          selectedPoliticians={selectedPoliticians}
          selectedIds={selectedIds}
          onToggle={toggleCompare}
          onOpenProfile={(id) => {
            setActiveId(id);
            setView('profile');
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ballot text-ink">
      <Header
        entryMode={entryMode}
        onReset={() => setEntryMode(null)}
        activePolitician={activePolitician}
        onFeed={() => setView('feed')}
        onProfile={() => {
          if (ownerId) setActiveId(ownerId);
          setView('profile');
        }}
        onCompare={() => setView('compare')}
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <LocationPanel
            location={location}
            onLocationChange={selectLocation}
            sectionQuery={sectionQuery}
            setSectionQuery={setSectionQuery}
            sectionError={sectionError}
            onSectionSearch={searchElectoralSection}
          />
          <Filters level={level} setLevel={setLevel} office={office} setOffice={setOffice} topic={topic} setTopic={setTopic} />
        </aside>

        <section className="min-w-0 space-y-4">
          <ContentModeToggle contentMode={contentMode} setContentMode={setContentMode} />

          {contentMode === 'feed' ? (
            <>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchScope={searchScope} setSearchScope={setSearchScope} />
              <FeedHeader
                count={visiblePoliticians.length}
                location={location}
                level={level}
                office={office}
                topic={topic}
                searchQuery={searchQuery}
                searchScope={searchScope}
              />
              <div className="space-y-4">
                {visiblePoliticians.map((politician) => (
                  <PoliticianPost
                    key={politician.id}
                    politician={politician}
                    selected={selectedIds.includes(politician.id)}
                    active={activePolitician.id === politician.id}
                    onOpen={() => {
                      setActiveId(politician.id);
                      setView('profile');
                    }}
                  />
                ))}
                {visiblePoliticians.length === 0 && <EmptyState onReset={resetFeedFilters} />}
              </div>
            </>
          ) : (
            <CivicChatbot location={location} />
          )}
        </section>
      </div>
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
              ¿Eres un candidato?
            </button>
          </div>

          <div className="mx-auto max-w-3xl text-center py-10 sm:py-16">
            <div className="inline-flex rounded-full border border-civic/25 bg-white px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-civic shadow-sm">
              Plataforma pública de propuestas
            </div>
            <h1 className="mt-8 text-5xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-6xl">
              El proyecto para la ciudadanía que quiere entender su elección local.
            </h1>
            <p className="mt-6 text-base leading-8 text-ink/70 sm:text-lg">
              Consulta candidatas, cargos y propuestas de tu distrito sin barreras. Las personas candidatas verificadas reclaman su perfil con código oficial para publicar propuestas reales y confiables.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <button
                type="button"
                onClick={onCitizenEnter}
                className="rounded-full bg-civic px-10 py-4 text-base font-black text-white shadow-xl transition hover:bg-civic/90"
              >
                Acceder
              </button>
              <button
                type="button"
                onClick={() => setIsCandidateLoginOpen(true)}
                className="rounded-full border border-ink/10 bg-white px-10 py-4 text-base font-black text-ink shadow-sm transition hover:bg-ink/5"
              >
                Soy candidato
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-ink/10 bg-white p-6 text-left shadow-panel">
              <p className="text-2xl font-black">Para la gente</p>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Explora propuestas por distrito sin iniciar sesión, sin publicidad y sin datos personales obligatorios.
              </p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-white p-6 text-left shadow-panel">
              <p className="text-2xl font-black">Para candidatos</p>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Reclama tu perfil con el código oficial y administra tus propuestas verificadas desde un acceso seguro.
              </p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-white p-6 text-left shadow-panel">
              <p className="text-2xl font-black">Transparencia local</p>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Visualiza agendas reales y conoce qué ofrecen quienes buscan tu voto, con contexto y datos electorales claros.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-panel sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-civic">Acceso</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                Entra como ciudadano y comienza a explorar.
              </h2>
              <p className="mt-4 hidden text-sm leading-6 text-ink/70">
                Los ciudadanos entran directamente para consultar información. Los candidatos usan su ID oficial para reclamar el perfil y trabajar propuestas verificadas.
              </p>
              <p className="mt-4 text-sm leading-6 text-ink/70">
                Consulta informacion electoral sin crear cuenta, sin likes, sin comentarios y sin entregar datos personales adicionales.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <section className="rounded-3xl border border-ink/10 bg-ballot p-6">
              <p className="text-xl font-black">Soy ciudadano</p>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Consulta candidatos, cargos y propuestas por ubicación sin registrar cuenta ni compartir datos personales extra.
              </p>
              <button
                type="button"
                onClick={onCitizenEnter}
                className="mt-6 h-14 w-full rounded-full bg-civic text-base font-black text-white transition hover:bg-civic/90"
              >
                Acceder como ciudadano
              </button>
            </section>

            <div className="hidden">
            {false && (
            <form
              id="politician-login"
              onSubmit={onPoliticianEnter}
              className="rounded-3xl border border-ink/10 bg-ink p-6 text-white"
            >
              <p className="text-xl font-black">Soy político o candidato</p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Usa tu código oficial para acceder al registro de propuestas y mantener tu perfil verificado.
              </p>
              <label className="mt-6 block text-sm font-black uppercase tracking-[0.12em] text-white/60">
                ID oficial
                <input
                  className="mt-3 h-14 w-full rounded-2xl border border-white/15 bg-white px-4 text-sm font-black text-ink outline-none focus:border-maize"
                  value={politicianCode}
                  onChange={(event) => setPoliticianCode(event.target.value)}
                  placeholder="MX-NL-MTY-PRESMUN-0001"
                />
              </label>
              {loginError && (
                <p className="mt-4 rounded-2xl bg-signal/20 p-4 text-sm font-bold text-white">
                  {loginError}
                </p>
              )}
              <button className="mt-6 h-14 w-full rounded-full bg-maize text-base font-black text-ink transition hover:bg-maize/90">
                Validar código
              </button>
            </form>
            )}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-ink/10 bg-ballot p-6 text-sm leading-6 text-ink/70">
            <p className="font-black">Consulta publica</p>
            <p className="mt-2">
              La ciudadania puede navegar por distrito, buscar candidaturas y usar IA para resumir o comparar informacion sin iniciar sesion.
            </p>
            <p className="mt-2 hidden">
              El código oficial es para reclamar tu perfil inicial. En producción, el acceso debe continuar con un registro seguro, email/magic link o autenticación de dos factores.
            </p>
          </div>
        </div>
      </section>

      {isCandidateLoginOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-4 py-6 backdrop-blur-sm">
          <form onSubmit={onPoliticianEnter} className="w-full max-w-lg rounded-3xl border border-white/10 bg-ink p-6 text-white shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-maize">Acceso de candidatura</p>
                <h2 className="mt-2 text-2xl font-black">Ingresa con tu ID oficial</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCandidateLoginOpen(false)}
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
      )}
    </main>
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

function Header({ entryMode, onReset, activePolitician, onFeed, onProfile, onCompare }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-ballot/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex min-w-0 items-center gap-3 font-black">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ink text-sm text-white">CD</span>
          <span className="truncate">CyberDemocracia</span>
        </a>
        <nav className="hidden items-center gap-5 text-sm font-bold text-ink/62 md:flex">
          <button className="hover:text-ink" onClick={onFeed}>Feed civico</button>
          {entryMode === 'politician' && <button className="hover:text-ink" onClick={onProfile}>Perfil</button>}
          {entryMode !== 'politician' && <button className="hover:text-ink" onClick={onCompare}>Comparar</button>}
        </nav>
        <button onClick={onReset} className="rounded-md border border-civic/25 bg-white px-3 py-2 text-xs font-black text-civic hover:bg-civic/10">
          {entryMode === 'politician' ? `Politico: ${activePolitician.name}` : 'Modo ciudadano'}
        </button>
      </div>
    </header>
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

function LocationPanel({ location, onLocationChange, sectionQuery, setSectionQuery, sectionError, onSectionSearch }) {
  const selectedPresetExists = locationPresets.some((preset) => preset.label === location.label);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Ubicacion electoral</p>
      <h1 className="mt-2 text-2xl font-black leading-tight">Encuentra a quienes aparecen en tu boleta.</h1>
      <p className="mt-3 text-sm leading-6 text-ink/68">
        En Chihuahua, la forma mas precisa es capturar la seccion electoral de tu credencial para encontrar tu distrito local.
      </p>
      <form onSubmit={onSectionSearch} className="mt-4 rounded-lg border border-civic/20 bg-civic/5 p-3">
        <label className="block text-xs font-black uppercase tracking-[0.12em] text-civic" htmlFor="electoral-section">
          Seccion electoral
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
          />
          <button className="h-11 rounded-md bg-civic px-4 text-sm font-black text-white transition hover:bg-civic/90">Buscar</button>
        </div>
        {sectionError ? (
          <p className="mt-2 text-xs font-bold leading-5 text-signal">{sectionError}</p>
        ) : (
          <p className="mt-2 text-xs font-bold leading-5 text-ink/55">La seccion aparece en tu credencial para votar. No guardamos este dato.</p>
        )}
      </form>
      <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-ink/45" htmlFor="location">
        O usa una ubicacion de prueba
      </label>
      <select
        id="location"
        className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
        value={location.label}
        onChange={(event) => onLocationChange(event.target.value)}
      >
        {!selectedPresetExists && <option>{location.label}</option>}
        {locationPresets.map((preset) => (
          <option key={preset.label}>{preset.label}</option>
        ))}
      </select>
      <DistrictMap location={location} />
      <div className="mt-4 rounded-lg bg-ink p-4 text-white">
        {location.electoralSection && <InfoRow light label="Seccion" value={`${location.electoralSection} (${location.sectionType})`} />}
        <InfoRow light label="Estado" value={location.state} />
        <InfoRow light label="Municipio" value={location.municipality} />
        <InfoRow light label="Distrito federal" value={location.federalDistrict} />
        <InfoRow light label="Distrito local" value={location.localDistrict} />
        {location.localDistrictHead && <InfoRow light label="Cabecera local" value={location.localDistrictHead} />}
      </div>
      <button className="mt-4 h-11 w-full rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5">
        Usar mi ubicacion
      </button>
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
      strokeColor: '#0F766E',
      strokeOpacity: 0.95,
      strokeWeight: 2,
      fillColor: district?.color ?? '#0F766E',
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

function Filters({ level, setLevel, office, setOffice, topic, setTopic }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Filtros</p>
      <div className="mt-4 space-y-4">
        <FilterGroup label="Nivel" options={levels} value={level} onChange={setLevel} />
        <FilterGroup label="Tema" options={topics} value={topic} onChange={setTopic} />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Cargo</span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
            value={office}
            onChange={(event) => setOffice(event.target.value)}
          >
            {offices.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-md px-3 py-2 text-xs font-black transition ${value === option ? 'bg-ink text-white' : 'bg-ink/5 text-ink/68 hover:bg-ink/10'}`}
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

function PoliticianPost({ politician, active, onOpen }) {
  const latestPost = politician.posts?.[0];
  const visibleTags = latestPost?.tags?.length ? latestPost.tags : politician.topics;
  const postTitle = latestPost?.title ?? 'Resumen del perfil';
  const postBody = latestPost?.body || politician.profile;
  const postType = latestPost?.type ?? 'Perfil publico';
  const postDate = latestPost?.createdAt || politician.updatedAt;

  return (
    <article className={`rounded-lg border bg-white p-4 shadow-panel transition hover:-translate-y-0.5 ${active ? 'border-civic/40' : 'border-ink/10'}`}>
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
        <img className="mt-4 h-56 w-full rounded-lg border border-ink/10 object-cover" src={latestPost.imageUrl} alt={latestPost.title} />
      )}

      <div className="mt-4 space-y-3">
        {politician.proposals.slice(0, 2).map((proposal) => (
          <div key={`${politician.id}-${proposal.topic}`} className="rounded-lg bg-ballot p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-civic">{proposal.topic}</p>
            <p className="mt-1 text-sm leading-6 text-ink/78">{proposal.text}</p>
          </div>
        ))}
      </div>
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3 text-xs font-bold text-ink/52">
        <span>Fuente: {politician.source}</span>
        <span>Publicado: {postDate}</span>
      </footer>
      <ShareActions
        className="mt-3"
        politicianId={politician.id}
        contentId={latestPost ? 'publicacion-reciente' : 'perfil'}
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
}) {
  const [summaryStatus, setSummaryStatus] = useState('idle');
  const [aiSummary, setAiSummary] = useState('');

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
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-black hover:bg-ink/5">
          Volver al feed
        </button>
        <button
          onClick={generateCandidateSummary}
          disabled={summaryStatus === 'loading'}
          className="rounded-md bg-signal px-4 py-2 text-sm font-black text-white transition hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-signal/50"
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
        <div className="h-32 bg-ink sm:h-40" />
        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {politician.photoUrl ? (
                <img className="h-24 w-24 rounded-lg border-4 border-white object-cover sm:h-28 sm:w-28" src={politician.photoUrl} alt={politician.name} />
              ) : (
                <div className="grid h-24 w-24 rounded-lg border-4 border-white bg-civic text-2xl font-black text-white sm:h-28 sm:w-28">
                  <span className="place-self-center">{politician.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="pb-1">
                <h1 className="text-3xl font-black leading-tight">{politician.name}</h1>
                <p className="mt-1 text-sm font-bold text-ink/55">{politician.party}</p>
              </div>
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
        />
      )}

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-civic">Propuestas oficiales anteriores</p>
        <div className="mt-4 space-y-3">
          {politician.proposals.map((proposal, index) => (
            <article key={`${politician.id}-proposal-page-${index}`} className="rounded-lg bg-ballot p-4">
              <p className="text-sm font-black text-civic">{proposal.topic}</p>
              <p className="mt-2 text-sm leading-6 text-ink/75">{proposal.text}</p>
              <ShareActions
                className="mt-3"
                politicianId={politician.id}
                contentId={`propuesta-${index + 1}`}
                title={`Propuesta de ${politician.name} sobre ${proposal.topic}`}
                text={`${proposal.text}\n\n${politician.name} | ${politician.office} | ${politician.party}`}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-ink/10 bg-white p-4 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-signal">Publicaciones y propuestas</p>
        <div className="mt-4 space-y-3">
          {(politician.posts ?? []).length === 0 && <p className="rounded-lg bg-ballot p-4 text-sm font-bold text-ink/58">Aun no hay publicaciones.</p>}
          {(politician.posts ?? []).map((post, index) => (
            <article key={`${politician.id}-post-page-${index}`} className="rounded-lg border border-ink/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-civic/10 px-2 py-1 text-xs font-black text-civic">{post.type ?? 'Publicacion'}</span>
                {(post.tags ?? []).map((tag) => <Tag key={`${post.title}-${tag}`}>{tag}</Tag>)}
              </div>
              <p className="mt-3 text-lg font-black">{post.title}</p>
              <p className="mt-1 text-xs font-bold text-ink/45">{post.createdAt}</p>
              {post.imageUrl && (
                <img className="mt-3 max-h-96 w-full rounded-lg object-cover" src={post.imageUrl} alt={post.title} />
              )}
              <p className="mt-3 text-sm leading-6 text-ink/72">{post.body}</p>
              <ShareActions
                className="mt-3"
                politicianId={politician.id}
                contentId={`publicacion-${index + 1}`}
                title={`${post.title} - ${politician.name}`}
                text={`${post.body}\n\n${politician.name} | ${politician.office} | ${politician.party}`}
              />
            </article>
          ))}
        </div>
      </section>
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
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
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

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_220px_180px]">
          <input
            className="h-11 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
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
          <select className="h-11 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic" value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
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
            className="h-11 rounded-md bg-signal px-4 text-sm font-black text-white transition hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-signal/40"
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
  return (
    <article className={`rounded-lg border bg-white p-4 shadow-panel transition hover:-translate-y-0.5 hover:shadow-panel ${selected ? 'border-civic ring-2 ring-civic/20' : 'border-ink/10'} ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Tag>{politician.level}</Tag>
            <Tag>{politician.office}</Tag>
          </div>
          <h2 className="mt-3 text-xl font-black">{politician.name}</h2>
          <p className="mt-1 text-sm font-bold text-ink/55">{politician.party}</p>
          <p className="mt-1 text-xs font-bold text-ink/45">{politician.municipality}, {politician.state}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink/70">{politician.profile}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {politician.topics.slice(0, 3).map((topic) => <Tag key={topic}>{topic}</Tag>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={onOpen} className="h-10 rounded-md border border-ink/15 text-sm font-black hover:bg-ink/5">Ver perfil</button>
        <button
          onClick={onSelect}
          disabled={disabled}
          className={`h-10 rounded-md text-sm font-black transition ${selected ? 'bg-ink text-white' : 'bg-civic text-white hover:bg-civic/90'} disabled:cursor-not-allowed`}
        >
          {selected ? 'Seleccionado' : 'Seleccionar'}
        </button>
      </div>
    </article>
  );
}

function AnalysisModal({ selectedPoliticians, question, setQuestion, analysis, status, onRun, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-4 shadow-panel">
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
        <div className={`mt-4 rounded-lg p-4 ${status === 'error' ? 'bg-signal/10 text-signal' : 'bg-ink text-white'}`}>
          <p className="text-sm font-black">{status === 'ready' ? 'Resultado' : 'Reglas'}</p>
          <p className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${status === 'error' ? 'text-signal' : 'text-white/72'}`}>
            {analysis || 'La IA no recomienda candidatos ni declara ganadores. Solo compara coincidencias, diferencias e informacion faltante.'}
          </p>
        </div>
      </section>
    </div>
  );
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
}) {
  const [profileDraft, setProfileDraft] = useState({
    name: politician.name,
    party: politician.party,
    profile: politician.profile,
    photoUrl: politician.photoUrl ?? '',
    source: politician.source,
  });
  const [valuesDraft, setValuesDraft] = useState((politician.values ?? []).join(', '));
  const [postDraft, setPostDraft] = useState({ title: '', body: '', type: 'Propuesta', tagsText: 'Salud', imageUrl: '' });
  const [savedMessage, setSavedMessage] = useState('');

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
  }, [politician.id]);

  const saveProfile = (event) => {
    event.preventDefault();
    onUpdateProfile(profileDraft);
    setSavedMessage('Perfil actualizado en esta sesion.');
  };

  const saveValues = (event) => {
    event.preventDefault();
    const values = valuesDraft
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    onUpdateValues(values);
    setSavedMessage('Valores actualizados.');
  };

  const handlePhotoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileDraft((draft) => ({ ...draft, photoUrl: reader.result }));
      onUpdateProfile({ ...profileDraft, photoUrl: reader.result });
      setSavedMessage('Foto actualizada en esta sesion.');
    };
    reader.readAsDataURL(file);
  };

  const savePost = (event) => {
    event.preventDefault();
    if (!postDraft.title.trim() || !postDraft.body.trim()) return;
    onAddPost({
      title: postDraft.title.trim(),
      body: postDraft.body.trim(),
      type: postDraft.type,
      tags: parseTags(postDraft.tagsText),
      imageUrl: postDraft.imageUrl,
      createdAt: 'Ahora',
    });
    setPostDraft({ title: '', body: '', type: 'Propuesta', tagsText: 'Salud', imageUrl: '' });
    setSavedMessage('Publicacion agregada con tags.');
  };

  const handlePostImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPostDraft((draft) => ({ ...draft, imageUrl: reader.result }));
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
        <AdminInput label="Partido o coalicion" value={profileDraft.party} onChange={(value) => setProfileDraft((draft) => ({ ...draft, party: value }))} />
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
              <label className="group cursor-pointer rounded-lg border border-ink/15 bg-ink p-4 text-white transition hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-panel focus-within:ring-2 focus-within:ring-ink/20">
                <input className="sr-only" type="file" accept="image/*" capture="user" onChange={handlePhotoFile} />
                <span className="block text-sm font-black">Tomar foto ahora</span>
                <span className="mt-1 block text-xs font-bold leading-5 text-white/60">En celular o navegador compatible abre la camara frontal.</span>
              </label>
            </div>
          </div>
          <div className="mt-3">
            <AdminInput label="O pega una URL de foto" value={profileDraft.photoUrl} onChange={(value) => setProfileDraft((draft) => ({ ...draft, photoUrl: value }))} />
          </div>
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
        <button className="h-10 w-full rounded-md bg-ink text-sm font-black text-white hover:bg-ink/90">
          Guardar perfil
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
            placeholder="Titulo"
          />
          <textarea
            className="min-h-24 resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
            value={postDraft.body}
            onChange={(event) => setPostDraft((draft) => ({ ...draft, body: event.target.value }))}
            placeholder="Escribe una propuesta, actualizacion o posicionamiento."
          />
          <input
            className="h-10 rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
            value={postDraft.tagsText}
            onChange={(event) => setPostDraft((draft) => ({ ...draft, tagsText: event.target.value }))}
            placeholder="Tags separados por coma: Salud, Vacunas, Infancia"
          />
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
              <label className="cursor-pointer rounded-lg border border-ink/15 bg-ink p-3 text-white transition hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-panel">
                <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={handlePostImageFile} />
                <span className="block text-sm font-black">Tomar foto</span>
                <span className="mt-1 block text-xs font-bold text-white/60">Camara del dispositivo</span>
              </label>
            </div>
            <input
              className="mt-3 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
              value={postDraft.imageUrl}
              onChange={(event) => setPostDraft((draft) => ({ ...draft, imageUrl: event.target.value }))}
              placeholder="O pega una URL de imagen"
            />
          </div>
        </div>
        <button className="mt-3 h-10 w-full rounded-md bg-civic text-sm font-black text-white hover:bg-civic/90">
          Publicar
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
                setSavedMessage('Propuesta actualizada.');
              }}
              onDelete={() => {
                onDeleteProposal(index);
                setSavedMessage('Propuesta eliminada.');
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
                onUpdatePost(index, nextPost);
                setSavedMessage('Publicacion actualizada.');
              }}
              onDelete={() => {
                onDeletePost(index);
                setSavedMessage('Publicacion eliminada.');
              }}
            />
          ))}
        </div>
      </div>

      {savedMessage && <p className="mt-4 rounded-md bg-civic/10 p-3 text-sm font-black text-civic">{savedMessage}</p>}
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
  const [draft, setDraft] = useState({ ...post, tagsText: (post.tags ?? []).join(', ') });

  useEffect(() => {
    setDraft({ ...post, tagsText: (post.tags ?? []).join(', ') });
  }, [post]);

  const saveDraft = () => {
    const { tagsText, ...rest } = draft;
    onSave({ ...rest, tags: parseTags(tagsText) });
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
        value={draft.title}
        onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
      />
      <textarea
        className="mt-2 min-h-24 w-full resize-none rounded-md border border-ink/15 bg-ballot p-3 text-sm leading-6 outline-none focus:border-civic"
        value={draft.body}
        onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
      />
      <input
        className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-ballot px-3 text-sm font-bold outline-none focus:border-civic"
        value={draft.tagsText}
        onChange={(event) => setDraft((current) => ({ ...current, tagsText: event.target.value }))}
        placeholder="Tags separados por coma"
      />
      <div className="mt-2 rounded-lg border border-ink/10 p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Imagen</p>
        {draft.imageUrl && <img className="mt-2 max-h-44 w-full rounded-md object-cover" src={draft.imageUrl} alt={draft.title} />}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="cursor-pointer rounded-md bg-civic/10 px-3 py-2 text-xs font-black text-civic hover:bg-civic/20">
            <input className="sr-only" type="file" accept="image/*" onChange={handleImageFile} />
            Cambiar imagen
          </label>
          <button type="button" onClick={() => setDraft((current) => ({ ...current, imageUrl: '' }))} className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black hover:bg-ink/5">
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

      <div className="bg-gradient-to-b from-ballot/70 to-white p-4">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessage(prompt)}
              className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-black text-ink/62 transition hover:-translate-y-0.5 hover:border-civic/35 hover:text-civic hover:shadow-panel"
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
            <p className="text-xs font-bold text-ink/45">Usa lenguaje natural. Ej. "quienes hablan de salud"</p>
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

function ShareActions({ politicianId, contentId, title, text, className = '' }) {
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
    <div className={`flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3 ${className}`}>
      <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Compartir</span>
      <button onClick={nativeShare} className="rounded-md bg-ink px-3 py-2 text-xs font-black text-white transition hover:bg-ink/90">
        Sistema
      </button>
      <a
        className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black transition hover:bg-ink/5"
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        X
      </a>
      <a
        className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black transition hover:bg-ink/5"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        Facebook
      </a>
      <a
        className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black transition hover:bg-ink/5"
        href={`https://wa.me/?text=${encodedTextWithUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
      <button
        onClick={() => copyValue(`${shareText}\n\n${shareUrl}`, 'Texto copiado para Instagram')}
        className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black transition hover:bg-ink/5"
      >
        Instagram
      </button>
      <button
        onClick={() => copyValue(shareUrl, 'URL copiada')}
        className="rounded-md border border-ink/15 px-3 py-2 text-xs font-black transition hover:bg-ink/5"
      >
        Copiar URL
      </button>
      {copied && <span className="text-xs font-black text-civic">{copied}</span>}
    </div>
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
    office: row.office ?? 'Cargo no definido',
    level: row.level ?? 'Federal',
    state: row.state ?? '',
    municipality: row.municipality ?? 'Todo el estado',
    federalDistrict: row.federal_district ?? 'No aplica',
    localDistrict: row.local_district ?? 'No aplica',
    topics,
    profile: row.profile || 'Este perfil politico todavia no tiene una biografia publicada.',
    proposals: proposals.map((proposal) => ({
      topic: proposal.topic ?? 'General',
      text: proposal.text ?? '',
    })),
    posts: posts.map((post) => ({
      title: post.title ?? 'Publicacion',
      body: post.body ?? '',
      type: post.type ?? 'Publicacion',
      tags: Array.isArray(post.tags) ? post.tags : [],
      imageUrl: post.imageUrl ?? '',
      createdAt: post.createdAt ?? '',
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
    Tema: politician.topics,
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
