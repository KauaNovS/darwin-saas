export const TIPOS_REGISTRO = [
  { key:'emocao',        emoji:'💜', label:'Emoção',        desc:'Como está se sentindo',   color:'#7b61ff', bg:'rgba(123,97,255,0.12)' },
  { key:'pensamento',    emoji:'🧠', label:'Pensamento',    desc:'O que está pensando',      color:'#38bdf8', bg:'rgba(56,189,248,0.12)'  },
  { key:'sensacao',      emoji:'🌊', label:'Sensação',      desc:'O que sente no corpo',     color:'#fb923c', bg:'rgba(251,146,60,0.12)'  },
  { key:'comportamento', emoji:'🔄', label:'Comportamento', desc:'Como está agindo',         color:'#ef4444', bg:'rgba(239,68,68,0.12)'   },
  { key:'evento',        emoji:'📌', label:'Evento',        desc:'O que aconteceu',          color:'#f472b6', bg:'rgba(244,114,182,0.12)' },
  { key:'atividade',     emoji:'⚡', label:'Atividade',     desc:'O que fez ou está fazendo',color:'#2dd4bf', bg:'rgba(45,212,191,0.12)'  },
  { key:'sono',          emoji:'🌙', label:'Sono',          desc:'Como foi o sono',          color:'#818cf8', bg:'rgba(129,140,248,0.12)' },
  { key:'memoria',       emoji:'🕰️', label:'Memória',       desc:'O que recordou',           color:'#f9a8d4', bg:'rgba(249,168,212,0.12)' },
] as const;

export type TipoRegistro = typeof TIPOS_REGISTRO[number]['key'];

export const EMOCOES = {
  positivas: { color:'#4ade80', label:'Positivas', items:['Alegria','Amor','Gratidão','Esperança','Motivação','Entusiasmo','Serenidade','Confiança','Satisfação','Orgulho','Alívio','Empolgação','Conexão','Inspiração','Plenitude','Leveza','Coragem','Acolhimento','Admiração','Paz'] },
  negativas: { color:'#f87171', label:'Negativas', items:['Ansiedade','Tristeza','Raiva','Medo','Frustração','Culpa','Vergonha','Solidão','Desânimo','Exaustão','Insegurança','Ressentimento','Angústia','Estresse','Vazio','Decepção','Opressão','Rejeição','Irritação','Impotência'] },
  neutras:   { color:'#818cf8', label:'Neutras',   items:['Curiosidade','Surpresa','Expectativa','Cautela','Indiferença','Reflexão','Dúvida','Adaptação','Presença','Observação','Alerta','Contemplação'] },
};

export const PENSAMENTOS = {
  automaticos: { color:'#fb923c', label:'Automáticos', items:['Ruminação','Catastrofização','Preocupação','Autocrítica','Pensamento invasivo','Hipervigilância','Antecipação negativa','Looping mental'] },
  distorcoes:  { color:'#f87171', label:'Distorções cognitivas', items:['Tudo ou nada','Generalização','Leitura mental','Filtro negativo','Personalização','Rotulação','Raciocínio emocional','Adivinhação do futuro'] },
  reflexivos:  { color:'#a78bfa', label:'Reflexivos', items:['Autorreflexão','Introspecção','Autoavaliação','Questionamento','Insight','Metacognição'] },
  criativos:   { color:'#f472b6', label:'Criativos / Positivos', items:['Imaginação','Planejamento','Inspiração','Idealização','Solução criativa','Aprendizado'] },
};

export const SENSACOES = {
  somaticas:   { color:'#f87171', label:'Corporais', items:['Tensão','Pressão','Formigamento','Palpitação','Dor','Fadiga muscular','Peso','Rigidez','Tremor','Espasmo','Frio','Calor','Arrepio'] },
  noeticas:    { color:'#a78bfa', label:'Mentais', items:['Clareza mental','Sobrecarga','Esgotamento mental','Foco','Dispersão','Confusão','Branco mental','Leveza cognitiva'] },
  existenciais:{ color:'#34d399', label:'Existenciais', items:['Presença','Distanciamento','Leveza existencial','Peso existencial','Vazio','Plenitude','Aprisionamento','Liberdade'] },
  energeticas: { color:'#fbbf24', label:'Energéticas', items:['Vitalidade','Exaustão','Energia física','Fraqueza','Disposição','Sonolência','Fadiga'] },
};

export const COMPORTAMENTOS = {
  adaptativos:    { color:'#4ade80', label:'Adaptativos', items:['Meditar','Exercitar','Estudar','Planejar','Organizar','Pedir ajuda','Comunicar','Descansar','Criar','Praticar gratidão','Respirar com atenção'] },
  desadaptativos: { color:'#f87171', label:'Desadaptativos', items:['Procrastinar','Isolar','Explosão emocional','Evitar','Compulsão','Ruminação ativa','Verificação excessiva','Autossabotagem','Impulsividade'] },
  automaticos:    { color:'#fb923c', label:'Automáticos', items:['Reação impulsiva','Congelamento','Fuga','Checagem repetitiva','Hipervigilância','Evitação'] },
  sociais:        { color:'#60a5fa', label:'Sociais', items:['Argumentar','Silenciar','Afastar','Aproximar','Apoiar','Confrontar','Ceder','Colaborar'] },
};

export const EVENTOS = {
  interpessoal: { color:'#f472b6', label:'Interpessoal', items:['Conversa importante','Discussão','Reencontro','Despedida','Declaração','Pedido de desculpas','Conflito resolvido','Traição','Apoio recebido'] },
  profissional: { color:'#38bdf8', label:'Profissional', items:['Reunião','Entrega','Feedback','Promoção','Demissão','Projeto novo','Erro','Conquista','Apresentação'] },
  pessoal:      { color:'#a78bfa', label:'Pessoal', items:['Decisão importante','Insight','Mudança','Perda','Conquista pessoal','Crise','Superação','Descoberta'] },
  externo:      { color:'#fbbf24', label:'Externo', items:['Notícia impactante','Acidente','Surpresa','Mudança de planos','Situação inesperada','Oportunidade'] },
};

export const ATIVIDADES = {
  fisica:     { color:'#2dd4bf', label:'Física', items:['Correr','Caminhar','Treinar','Nadar','Dançar','Yoga','Alongar','Esporte','Pedalar'] },
  cognitiva:  { color:'#38bdf8', label:'Cognitiva', items:['Estudar','Ler','Pesquisar','Escrever','Resolver problemas','Planejar','Aprender algo novo'] },
  criativa:   { color:'#f472b6', label:'Criativa', items:['Desenhar','Tocar instrumento','Compor','Cozinhar criativamente','Fotografar','Criar conteúdo'] },
  social:     { color:'#60a5fa', label:'Social', items:['Conversar','Sair com amigos','Evento social','Videochamada','Ajudar alguém','Trabalho em equipe'] },
  autocuidado:{ color:'#a78bfa', label:'Autocuidado', items:['Meditar','Terapia','Diário','Banho consciente','Descanso intencional','Alimentação cuidadosa'] },
  digital:    { color:'#818cf8', label:'Digital', items:['Redes sociais','Jogos','Séries','Notícias','Trabalho remoto','Estudo online'] },
};

export const MEMORIAS = {
  episodica:     { color:'#f9a8d4', label:'Episódica', desc:'Uma experiência específica com contexto de tempo e lugar' },
  emocional:     { color:'#f87171', label:'Emocional', desc:'Fortalecida por carga afetiva intensa' },
  autobiografica:{ color:'#fbbf24', label:'Autobiográfica', desc:'Parte da narrativa da sua identidade' },
  semantica:     { color:'#a78bfa', label:'Semântica', desc:'Conhecimento, fato ou aprendizado' },
  procedural:    { color:'#34d399', label:'Procedural', desc:'Habilidade ou hábito aprendido' },
  prospectiva:   { color:'#818cf8', label:'Prospectiva', desc:'Intenção ou compromisso futuro' },
};
