/*
  Impacta+ / Signal Garden
  A camada de comportamento mantém a experiência leve e explicável: cada acção muda o estado,
  dá feedback visual e persiste apenas dados demonstrativos no navegador.
*/

const STORAGE_KEY = 'impacta-plus-state-v1';

const defaultState = {
  loggedIn: false,
  profile: {
    name: 'Lucca Martins',
    email: 'lucca@orbecircular.com',
    org: 'Orbe Circular',
    location: 'São Paulo, Brasil',
  },
  period: 'month',
  savedOpportunities: ['op-2'],
  connections: [
    { id: 'c-1', name: 'EcoMobi', initial: 'E', type: 'empresa', typeLabel: 'Empresa', className: 'blue', city: 'São Paulo, SP', material: 'Plástico reciclado', quantity: '850 kg', description: 'Demanda recorrente por plástico reciclado pós-consumo para linha de mobiliário urbano.' },
    { id: 'c-2', name: 'ReciclaSul', initial: 'R', type: 'cooperativa', typeLabel: 'Cooperativa', city: 'São Paulo, SP', material: 'Papel e papelão', quantity: '1.200 kg', description: 'Cooperativa parceira com capacidade disponível para triagem e reaproveitamento.' },
    { id: 'c-3', name: 'Instituto Vértice', initial: 'V', type: 'organizacao', typeLabel: 'Organização', className: 'violet', city: 'Campinas, SP', material: 'Resíduos orgânicos', quantity: '420 kg', description: 'Organização local à procura de parceiros para ampliar a compostagem comunitária.' },
    { id: 'c-4', name: 'Verdejar Alimentos', initial: 'V', type: 'empresa', typeLabel: 'Empresa', className: 'green', city: 'Santos, SP', material: 'Orgânicos', quantity: '680 kg', description: 'Geração estável de resíduos orgânicos com interesse em rota de compostagem.' },
    { id: 'c-5', name: 'Coop. Nova Rota', initial: 'N', type: 'cooperativa', typeLabel: 'Cooperativa', className: 'orange', city: 'Guarulhos, SP', material: 'Alumínio', quantity: '210 kg', description: 'Rede de catadores com disponibilidade para coleta de materiais metálicos.' },
    { id: 'c-6', name: 'Ponto de Encontro', initial: 'P', type: 'organizacao', typeLabel: 'Organização', className: 'dark', city: 'Osasco, SP', material: 'Eletrônicos', quantity: '94 unidades', description: 'Ponto de recebimento com agenda aberta para descarte responsável de eletrônicos.' },
  ],
};

const opportunityData = [
  { id: 'op-1', priority: 'alta', priorityLabel: 'Alta prioridade', title: 'Rota de plástico reciclado', description: 'A EcoMobi tem demanda imediata e a sua rede possui estoque compatível.', tags: ['850 kg', '2,4 km'], partner: 'EcoMobi', location: 'São Paulo, SP' },
  { id: 'op-2', priority: 'nova', priorityLabel: 'Nova oportunidade', title: 'Compostagem em expansão', description: 'Instituto Vértice procura parceiros para processar o aumento de orgânicos.', tags: ['420 kg', 'Impacto social'], partner: 'Instituto Vértice', location: 'Campinas, SP' },
  { id: 'op-3', priority: 'alta', priorityLabel: 'Alta prioridade', title: 'Alumínio com coleta disponível', description: 'Uma cooperativa próxima pode absorver a próxima janela de coleta.', tags: ['210 kg', '5,1 km'], partner: 'Coop. Nova Rota', location: 'Guarulhos, SP' },
  { id: 'op-4', priority: 'nova', priorityLabel: 'Nova oportunidade', title: 'Parceria para educação ambiental', description: 'Uma organização local busca dados para uma campanha de consumo consciente.', tags: ['Dados', 'Comunidade'], partner: 'Ponto de Encontro', location: 'Osasco, SP' },
  { id: 'op-5', priority: 'salva', priorityLabel: 'Salva por você', title: 'Eletrônicos para recondicionamento', description: 'Oportunidade de destinação para equipamentos que ainda podem voltar a circular.', tags: ['94 un.', 'Reuso'], partner: 'ReTech Social', location: 'Santo André, SP' },
  { id: 'op-6', priority: 'nova', priorityLabel: 'Nova oportunidade', title: 'Papelão em ciclo curto', description: 'Conexão de baixo atrito entre volume recorrente e capacidade de triagem.', tags: ['1.200 kg', '3,8 km'], partner: 'ReciclaSul', location: 'São Paulo, SP' },
];

const insightData = {
  plastic: { number: '01', badge: 'Alta relevância', title: 'Demanda por plástico reciclado + estoque disponível', text: 'O Impacta+ identificou que a EcoMobi possui demanda por 850 kg de plástico reciclado e existe disponibilidade compatível no sistema.', detail: 'Compatibilidade estimada em 94% · Distância da rota: 2,4 km · Potencial: +42 pts', action: 'Abrir conexão', tone: 'featured', symbol: '⌁' },
  organic: { number: '02', badge: 'Atenção', title: 'Aumento de resíduos orgânicos', text: 'O sistema detectou aumento de 21% na geração de resíduos orgânicos nas últimas 3 semanas.', detail: 'Recomendação: considere ampliar a capacidade de compostagem nas próximas semanas.', action: 'Ver análise', tone: 'orange-tone', symbol: '◒' },
  partnership: { number: '03', badge: 'Oportunidade', title: 'Nova oportunidade de parceria', text: 'Uma organização próxima possui perfil compatível com os materiais cadastrados e está aberta a uma primeira conversa.', detail: '3 organizações compatíveis · Maior aderência: Instituto Vértice · Potencial: +28 pts', action: 'Explorar oportunidade', tone: 'blue-tone', symbol: '✦' },
};

let state = loadState();

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved, profile: { ...defaultState.profile, ...(saved.profile || {}) } } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function formatQuantity(value) {
  return value >= 1000 ? `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k` : value.toLocaleString('pt-BR');
}

function showApp() {
  $('#login-screen').classList.add('is-hidden');
  $('#app-shell').classList.remove('is-hidden');
  updateProfileView();
  renderConnections();
  renderOpportunities();
  renderInsights();
  showSection(location.hash.replace('#', '') || 'dashboard', false);
}

function showLogin() {
  $('#login-screen').classList.remove('is-hidden');
  $('#app-shell').classList.add('is-hidden');
}

function showSectionBase(name = 'dashboard', updateHash = true) {
  const valid = ['dashboard', 'conexoes', 'oportunidades', 'inteligencia', 'impacto', 'ranking', 'perfil'];
  const target = valid.includes(name) ? name : 'dashboard';
  $$('.app-section').forEach((section) => section.classList.toggle('active-section', section.id === `section-${target}`));
  $$('.nav-item[data-nav]').forEach((item) => item.classList.toggle('active', item.dataset.nav === target));
  const labels = { dashboard: 'Visão geral', conexoes: 'Conexões', oportunidades: 'Oportunidades', inteligencia: 'Insights', impacto: 'Impacto', ranking: 'Ranking', perfil: 'Perfil' };
  $('#page-breadcrumb').textContent = labels[target];
  if (updateHash && location.hash !== `#${target}`) history.replaceState(null, '', `#${target}`);
  $('#sidebar').classList.remove('mobile-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toast(message, type = 'success') {
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.textContent = message;
  $('#toast-region').append(item);
  window.setTimeout(() => item.remove(), 3600);
}

function openModal(content, extraClass = '') {
  $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal-card ${extraClass}" role="dialog" aria-modal="true" onclick="event.stopPropagation()">${content}</div></div>`;
}

function closeModal() {
  $('#modal-root').innerHTML = '';
}

function renderConnections() {
  const list = $('#connections-list');
  if (!list) return;
  const query = ($('#connection-search')?.value || '').toLowerCase().trim();
  const activeFilter = $('.filter-button[data-connection-filter].active')?.dataset.connectionFilter || 'all';
  const visible = state.connections.filter((connection) => {
    const matchesFilter = activeFilter === 'all' || connection.type === activeFilter;
    const haystack = `${connection.name} ${connection.material} ${connection.city} ${connection.typeLabel}`.toLowerCase();
    return matchesFilter && haystack.includes(query);
  });
  list.innerHTML = visible.length ? visible.map((connection) => `
    <article class="connection-card">
      <div class="connection-head"><span class="connection-avatar ${connection.className || connection.type}">${escapeHtml(connection.initial)}</span><div><h4>${escapeHtml(connection.name)}</h4><p>${escapeHtml(connection.city)}</p></div><span class="connection-type">${escapeHtml(connection.typeLabel)}</span></div>
      <p>${escapeHtml(connection.description)}</p>
      <div class="connection-meta"><span>♺ ${escapeHtml(connection.material)}</span><span>${escapeHtml(connection.quantity)}</span><button class="connection-action" data-connection="${escapeHtml(connection.id)}" aria-label="Ver informações de ${escapeHtml(connection.name)}">Ver informações →</button></div>
    </article>`).join('') : '<div class="empty-state"><strong>Nenhuma conexão encontrada.</strong>Tente outro termo ou limpe os filtros para voltar a explorar a rede.</div>';
  const active = $('#active-connections');
  if (active) active.textContent = (247 + Math.max(0, state.connections.length - defaultState.connections.length)).toLocaleString('pt-BR');
}

function renderOpportunities(filter = null) {
  const list = $('#opportunities-list');
  if (!list) return;
  const activeFilter = filter || $('.filter-button[data-opportunity-filter].active')?.dataset.opportunityFilter || 'all';
  const visible = opportunityData.filter((opportunity) => activeFilter === 'all' || opportunity.priority === activeFilter || (activeFilter === 'salva' && state.savedOpportunities.includes(opportunity.id)));
  list.innerHTML = visible.map((opportunity) => {
    const saved = state.savedOpportunities.includes(opportunity.id);
    const green = opportunity.priority === 'salva';
    return `<article class="opportunity-card"><div class="opportunity-priority"><span class="priority-label ${green ? 'green' : ''}"><i></i>${escapeHtml(opportunity.priorityLabel)}</span><button class="save-opportunity ${saved ? 'saved' : ''}" data-save-opportunity="${opportunity.id}" aria-label="${saved ? 'Remover dos salvos' : 'Salvar oportunidade'}">${saved ? '★' : '☆'}</button></div><h4>${escapeHtml(opportunity.title)}</h4><p>${escapeHtml(opportunity.description)}</p><div class="opportunity-tags">${opportunity.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div><div class="opportunity-foot"><small>⌖ ${escapeHtml(opportunity.location)}</small><button data-opportunity="${opportunity.id}">Explorar →</button></div></article>`;
  }).join('');
  if (!visible.length) list.innerHTML = '<div class="empty-state"><strong>O radar está limpo por aqui.</strong>Não há oportunidades com este filtro neste momento.</div>';
}

function renderInsights() {
  const container = $('#insights-page-grid');
  if (!container) return;
  container.innerHTML = Object.entries(insightData).map(([key, insight]) => `<article class="insight-card ${insight.tone}"><div class="insight-top"><span class="insight-number">${insight.number}</span><span class="insight-badge ${insight.tone === 'orange-tone' ? 'orange' : insight.tone === 'blue-tone' ? 'blue' : ''}">${insight.badge}</span></div><div class="insight-symbol ${insight.tone === 'orange-tone' ? 'orange-text' : insight.tone === 'blue-tone' ? 'blue-text' : ''}">${insight.symbol}</div><h4>${insight.title}</h4><p>${insight.text}</p><button class="insight-action" data-insight="${key}">${insight.action} <span>→</span></button></article>`).join('');
}

function updateProfileView() {
  const profile = state.profile;
  const nameParts = profile.name.trim().split(/\s+/);
  const initial = (nameParts[0]?.[0] || 'L').toUpperCase();
  $$('.user-avatar, .profile-avatar-large, .demo-avatar').forEach((element) => { element.textContent = initial; });
  $('.user-meta strong').textContent = profile.name;
  if ($('#profile-name')) $('#profile-name').value = profile.name;
  if ($('#profile-email')) $('#profile-email').value = profile.email;
  if ($('#profile-org')) $('#profile-org').value = profile.org;
  if ($('#profile-location')) $('#profile-location').value = profile.location;
  $$('.profile-card-body h3').forEach((element) => { element.textContent = profile.name; });
  $$('.profile-card-body > p').forEach((element) => { element.textContent = `Administrador · ${profile.org}`; });
  $$('.profile-location').forEach((element) => { element.textContent = `⌖ ${profile.location}`; });
}

function openInsight(key) {
  const insight = insightData[key];
  if (!insight) return;
  openModal(`<div class="modal-head"><div><span class="eyebrow teal">INSIGHT #${insight.number}</span><h3>${insight.title}</h3></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></div><div class="modal-body"><div class="insight-detail">${insight.detail}</div><p>${insight.text}</p><p>Esta leitura foi formada a partir dos dados recentes da sua rede, dos materiais cadastrados e das organizações próximas. Você pode iniciar uma conversa ou guardar esta leitura para acompanhar a evolução.</p></div><div class="modal-footer"><button class="outline-button" data-action="close-modal">Agora não</button><button class="primary-button" data-action="insight-confirm">${insight.action} <span>→</span></button></div>`);
}

function openConnection(id) {
  const connection = state.connections.find((item) => item.id === id);
  if (!connection) return;
  openModal(`<div class="modal-head"><div><span class="eyebrow teal">CONEXÃO DA REDE</span><h3>${escapeHtml(connection.name)}</h3></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></div><div class="modal-body"><div class="insight-detail"><strong>${escapeHtml(connection.material)}</strong> · ${escapeHtml(connection.quantity)} · ${escapeHtml(connection.city)}</div><h4>Sobre esta conexão</h4><p>${escapeHtml(connection.description)}</p><p>O perfil apresenta alta compatibilidade com os dados do workspace Orbe Circular. Este é um espaço demonstrativo: a próxima conversa pode ser iniciada a partir daqui.</p></div><div class="modal-footer"><button class="outline-button" data-action="close-modal">Fechar</button><button class="primary-button" data-action="start-connection">Iniciar conversa <span>→</span></button></div>`);
}

function openNewConnection() {
  openModal(`<div class="modal-head"><div><span class="eyebrow teal">ADICIONAR À REDE</span><h3>Nova conexão</h3></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></div><form id="new-connection-form" class="modal-form"><label>Nome da organização<input name="name" required placeholder="Ex.: Rede Circular" /></label><label>Tipo<select name="type"><option value="empresa">Empresa</option><option value="cooperativa">Cooperativa</option><option value="organizacao">Organização</option></select></label><label>Cidade<input name="city" required placeholder="Ex.: São Paulo, SP" /></label><label>Material ou recurso<input name="material" required placeholder="Ex.: Papel e papelão" /></label><label>Quantidade disponível<input name="quantity" required placeholder="Ex.: 300 kg" /></label><div class="modal-footer"><button type="button" class="outline-button" data-action="close-modal">Cancelar</button><button type="submit" class="primary-button">Adicionar conexão <span>→</span></button></div></form>`);
}

function updateChart(period) {
  const paths = {
    week: { line: 'M0,210 C45,203 58,172 100,184 S167,150 204,163 S260,102 306,128 S360,91 408,111 S466,53 505,77 S567,43 616,62 S682,20 724,47 S765,36 800,18', area: 'M0,210 C45,203 58,172 100,184 S167,150 204,163 S260,102 306,128 S360,91 408,111 S466,53 505,77 S567,43 616,62 S682,20 724,47 S765,36 800,18 V260 H0 Z', total: '6.240', change: '+9,4%', labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] },
    month: { line: 'M0,218 C52,210 65,178 105,189 S170,165 205,173 S270,116 310,141 S365,108 410,121 S470,72 507,97 S560,68 602,78 S670,29 714,52 S764,42 800,18', area: 'M0,218 C52,210 65,178 105,189 S170,165 205,173 S270,116 310,141 S365,108 410,121 S470,72 507,97 S560,68 602,78 S670,29 714,52 S764,42 800,18 V260 H0 Z', total: '24.680', change: '+16,8%', labels: ['01 Ago', '08 Ago', '15 Ago', '22 Ago', '29 Ago'] },
    year: { line: 'M0,225 C45,207 80,221 115,190 S174,183 212,192 S269,159 312,173 S368,132 416,143 S474,115 520,127 S570,91 614,104 S671,60 716,73 S767,33 800,22', area: 'M0,225 C45,207 80,221 115,190 S174,183 212,192 S269,159 312,173 S368,132 416,143 S474,115 520,127 S570,91 614,104 S671,60 716,73 S767,33 800,22 V260 H0 Z', total: '92.400', change: '+28,2%', labels: ['Jan', 'Mar', 'Mai', 'Jul', 'Set'] },
  };
  const next = paths[period] || paths.month;
  $('#chart-line').setAttribute('d', next.line);
  $('#chart-area').setAttribute('d', next.area);
  $('#chart-total').innerHTML = `${next.total} <small>pts</small>`;
  $('.chart-metric .trend').innerHTML = `${next.change} <i>↗</i>`;
  $('.chart-x-labels').innerHTML = next.labels.map((label) => `<span>${label}</span>`).join('');
  $$('.chart-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.period === period));
  state.period = period;
  persist();
}

function toggleNotifications() {
  const existing = $('.notification-drawer');
  if (existing) { existing.remove(); return; }
  const drawer = document.createElement('aside');
  drawer.className = 'notification-drawer';
  drawer.innerHTML = `<div class="notification-drawer-head"><h3>Notificações</h3><button class="text-button" data-action="mark-notifications">Marcar como lidas</button></div><div class="notification-item"><span>✦</span><p><strong>Novo insight encontrado.</strong><br />Há uma possível conexão entre plástico e a EcoMobi.<small>há 8 minutos</small></p></div><div class="notification-item"><span>↗</span><p><strong>Meta mensal alcançada.</strong><br />O workspace superou o objectivo de Agosto.<small>há 2 horas</small></p></div><div class="notification-item"><span>⌁</span><p><strong>Nova organização na rede.</strong><br />Instituto Vértice acabou de se juntar.<small>ontem</small></p></div>`;
  document.body.append(drawer);
}

function saveProfile() {
  state.profile = { name: $('#profile-name').value.trim() || defaultState.profile.name, email: $('#profile-email').value.trim() || defaultState.profile.email, org: $('#profile-org').value.trim() || defaultState.profile.org, location: $('#profile-location').value.trim() || defaultState.profile.location };
  persist();
  updateProfileView();
  toast('Perfil actualizado e guardado no navegador.');
}

function handleActionBase(action, target) {
  switch (action) {
    case 'demo-login':
      state.loggedIn = true; persist(); showApp(); toast('Ambiente demonstrativo carregado.'); break;
    case 'logout':
      state.loggedIn = false; persist(); showLogin(); toast('Sessão encerrada.'); break;
    case 'open-menu': $('#sidebar').classList.add('mobile-open'); break;
    case 'close-menu': $('#sidebar').classList.remove('mobile-open'); break;
    case 'close-modal': closeModal(); break;
    case 'notifications': toggleNotifications(); break;
    case 'mark-notifications': target.closest('.notification-drawer')?.remove(); toast('Notificações marcadas como lidas.'); break;
    case 'toggle-password': {
      const input = $('#password'); input.type = input.type === 'password' ? 'text' : 'password'; target.textContent = input.type === 'password' ? '◉' : '◌'; break;
    }
    case 'forgot': toast('No protótipo, o fluxo de recuperação foi sinalizado para o time.'); break;
    case 'terms': toast('Os termos de uso estarão disponíveis na versão de publicação.'); break;
    case 'privacy': toast('A política de privacidade estará disponível na versão de publicação.'); break;
    case 'new-connection': openNewConnection(); break;
    case 'settings': toast('Configurações gerais disponíveis na próxima camada do produto.'); break;
    case 'goal-menu': toast('Meta anual: 125.000 pontos até 31 de dezembro de 2026.'); break;
    case 'run-analysis': target.disabled = true; target.textContent = '⌁ Analisando...'; window.setTimeout(() => { target.disabled = false; target.innerHTML = '↻ Rodar nova análise'; toast('Análise concluída: 3 sinais relevantes confirmados.'); }, 1200); break;
    case 'export': case 'export-opportunities': case 'export-impact': toast('Relatório demonstrativo preparado para exportação.'); break;
    case 'sort-opportunities': toast('Ordenação actual: oportunidades mais relevantes.'); break;
    case 'filter-menu': toast('Filtros avançados estarão disponíveis quando houver mais dados.'); break;
    case 'ranking-info': toast('O ranking combina Impact Score, circularidade e impacto social.'); break;
    case 'ranking-more': toast('Você está em #18 — faltam 62 pontos para entrar no top 15.'); break;
    case 'profile': showSection('perfil'); break;
    case 'save-profile': saveProfile(); break;
    case 'insight-confirm': closeModal(); showSection('conexoes'); toast('Conexão pronta para ser explorada.'); break;
    case 'start-connection': closeModal(); toast('Conversa iniciada em modo demonstrativo.'); break;
    case 'back': case 'cancel': closeModal(); break;
    case 'new-connection-cancel': closeModal(); break;
    default: break;
  }
}

document.addEventListener('click', (event) => {
  const nav = event.target.closest('[data-nav]');
  if (nav) { event.preventDefault(); showSection(nav.dataset.nav); return; }
  const actionTarget = event.target.closest('[data-action]');
  if (actionTarget) { handleAction(actionTarget.dataset.action, actionTarget); return; }
  const insight = event.target.closest('[data-insight]');
  if (insight) { openInsight(insight.dataset.insight); return; }
  const connection = event.target.closest('[data-connection]');
  if (connection) { openConnection(connection.dataset.connection); return; }
  const opportunity = event.target.closest('[data-opportunity]');
  if (opportunity) { const item = opportunityData.find((entry) => entry.id === opportunity.dataset.opportunity); if (item) { openModal(`<div class="modal-head"><div><span class="eyebrow teal">OPORTUNIDADE DETECTADA</span><h3>${escapeHtml(item.title)}</h3></div><button class="modal-close" data-action="close-modal">×</button></div><div class="modal-body"><div class="insight-detail">${escapeHtml(item.partner)} · ${escapeHtml(item.location)}<br /><strong>${item.tags.join(' · ')}</strong></div><p>${escapeHtml(item.description)}</p><p>Esta oportunidade foi priorizada pela combinação entre proximidade, disponibilidade e potencial de impacto.</p></div><div class="modal-footer"><button class="outline-button" data-action="close-modal">Fechar</button><button class="primary-button" data-action="start-connection">Quero explorar <span>→</span></button></div>`); } return; }
  const save = event.target.closest('[data-save-opportunity]');
  if (save) { const id = save.dataset.saveOpportunity; state.savedOpportunities = state.savedOpportunities.includes(id) ? state.savedOpportunities.filter((item) => item !== id) : [...state.savedOpportunities, id]; persist(); renderOpportunities(); toast(state.savedOpportunities.includes(id) ? 'Oportunidade salva no seu radar.' : 'Oportunidade removida do radar.'); return; }
  if (event.target.classList.contains('modal-backdrop')) closeModal();
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'login-form') {
    event.preventDefault();
    const email = $('#email').value.trim();
    if (!email || !$('#password').value) { toast('Preencha e-mail e senha para continuar.', 'error'); return; }
    state.loggedIn = true; state.profile.email = email; persist(); showApp(); toast('Sessão iniciada no ambiente demonstrativo.');
  }
  if (event.target.id === 'new-connection-form') {
    event.preventDefault();
    const data = new FormData(event.target);
    const type = data.get('type');
    const typeLabel = type === 'empresa' ? 'Empresa' : type === 'cooperativa' ? 'Cooperativa' : 'Organização';
    const name = String(data.get('name')).trim();
    const newConnection = { id: `c-${Date.now()}`, name, initial: name.charAt(0).toUpperCase(), type, typeLabel, city: String(data.get('city')).trim(), material: String(data.get('material')).trim(), quantity: String(data.get('quantity')).trim(), description: 'Nova conexão adicionada manualmente ao workspace para avaliação de compatibilidade.' };
    state.connections.unshift(newConnection); persist(); renderConnections(); closeModal(); showSection('conexoes'); toast(`${name} foi adicionada à sua rede.`);
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'connection-search') renderConnections();
  if (event.target.id === 'global-search' && event.target.value.trim().length > 1) {
    showSection('conexoes');
    $('#connection-search').value = event.target.value;
    renderConnections();
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#global-search')?.focus(); }
  if (event.key === 'Escape') { closeModal(); $('.notification-drawer')?.remove(); }
});

document.addEventListener('click', (event) => {
  const connectionFilter = event.target.closest('[data-connection-filter]');
  if (connectionFilter) { $$('.filter-button[data-connection-filter]').forEach((button) => button.classList.toggle('active', button === connectionFilter)); renderConnections(); }
  const opportunityFilter = event.target.closest('[data-opportunity-filter]');
  if (opportunityFilter) { $$('.filter-button[data-opportunity-filter]').forEach((button) => button.classList.toggle('active', button === opportunityFilter)); renderOpportunities(opportunityFilter.dataset.opportunityFilter); }
  const period = event.target.closest('[data-period]');
  if (period) updateChart(period.dataset.period);
});

window.addEventListener('hashchange', () => showSection(location.hash.replace('#', ''), false));

if (new URLSearchParams(location.search).get('demo') === '1') { state.loggedIn = true; persist(); }
if (state.loggedIn) showApp(); else showLogin();
updateChart(state.period);

/* Revisão Impacta+: extensões de produto solicitadas pelo utilizador. */
state.language = state.language || 'pt';
state.theme = state.theme || 'light';
state.accessibility = { largeText: false, highContrast: false, reducedMotion: false, ...(state.accessibility || {}) };
state.missions = state.missions || {};

const sectionLabels = { dashboard: 'Visão geral', conexoes: 'Conexões', oportunidades: 'Oportunidades', inteligencia: 'Insights', impacto: 'Impacto', jornada: 'Jornada', ranking: 'Ranking', perfil: 'Perfil' };
const sectionLabelsEn = { dashboard: 'Overview', conexoes: 'Connections', oportunidades: 'Opportunities', inteligencia: 'Insights', impacto: 'Impact', jornada: 'Journey', ranking: 'Ranking', perfil: 'Profile' };
const translations = {
  pt: { navDashboard: 'Visão geral', navConnections: 'Conexões', navOpportunities: 'Oportunidades', navInsights: 'Insights', navImpact: 'Impacto', navJourney: 'Jornada', navRanking: 'Ranking', navSettings: 'Configurações', navLogout: 'Sair' },
  en: { navDashboard: 'Overview', navConnections: 'Connections', navOpportunities: 'Opportunities', navInsights: 'Insights', navImpact: 'Impact', navJourney: 'Journey', navRanking: 'Ranking', navSettings: 'Settings', navLogout: 'Log out' },
};

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.classList.toggle('large-text', Boolean(state.accessibility.largeText));
  document.documentElement.classList.toggle('high-contrast', Boolean(state.accessibility.highContrast));
  document.documentElement.classList.toggle('reduced-motion', Boolean(state.accessibility.reducedMotion));
  const icon = $('#theme-icon');
  if (icon) icon.textContent = state.theme === 'dark' ? '☀' : '☾';
  const select = $('#language-select');
  if (select) select.value = state.language;
  persist();
}

function applyLanguage() {
  const lang = state.language;
  const copy = translations[lang];
  $$('[data-i18n]').forEach((element) => { if (copy[element.dataset.i18n]) element.textContent = copy[element.dataset.i18n]; });
  const search = $('#global-search');
  if (search) search.placeholder = lang === 'en' ? 'Search signals and people...' : 'Buscar sinais e pessoas...';
  const breadcrumb = $('#page-breadcrumb');
  if (breadcrumb) { const key = location.hash.replace('#', '') || 'dashboard'; breadcrumb.textContent = lang === 'en' ? (sectionLabelsEn[key] || sectionLabelsEn.dashboard) : (sectionLabels[key] || sectionLabels.dashboard); }
  document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
  document.title = lang === 'en' ? 'Impacta+ — Impact intelligence center' : 'Impacta+ — Central de inteligência de impacto';
}

function showSection(name = 'dashboard', updateHash = true) {
  const valid = ['dashboard', 'conexoes', 'oportunidades', 'inteligencia', 'impacto', 'jornada', 'ranking', 'perfil'];
  const target = valid.includes(name) ? name : 'dashboard';
  $$('.app-section').forEach((section) => section.classList.toggle('active-section', section.id === `section-${target}`));
  $$('.nav-item[data-nav]').forEach((item) => item.classList.toggle('active', item.dataset.nav === target));
  const labels = state.language === 'en' ? { dashboard: 'Overview', conexoes: 'Connections', oportunidades: 'Opportunities', inteligencia: 'Insights', impacto: 'Impact', jornada: 'Journey', ranking: 'Ranking', perfil: 'Profile' } : { dashboard: 'Visão geral', conexoes: 'Conexões', oportunidades: 'Oportunidades', inteligencia: 'Insights', impacto: 'Impacto', jornada: 'Jornada', ranking: 'Ranking', perfil: 'Perfil' };
  $('#page-breadcrumb').textContent = labels[target];
  if (updateHash && location.hash !== `#${target}`) history.replaceState(null, '', `#${target}`);
  $('#sidebar').classList.remove('mobile-open');
  $('.notification-drawer')?.remove();
  window.scrollTo({ top: 0, behavior: state.accessibility?.reducedMotion ? 'auto' : 'smooth' });
}

function settingsModal() {
  const checked = (value) => value ? 'checked' : '';
  openModal(`<div class="modal-head"><div><span class="eyebrow teal">PREFERÊNCIAS DO IMPACTA+</span><h3>Configurações</h3></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></div><div class="settings-modal-body"><div class="setting-row"><div><strong>Tema da interface</strong><small>Escolha como quer acompanhar os sinais.</small></div><div class="segmented-control"><button class="${state.theme === 'light' ? 'active' : ''}" data-setting-theme="light">Claro</button><button class="${state.theme === 'dark' ? 'active' : ''}" data-setting-theme="dark">Escuro</button></div></div><div class="setting-row"><div><strong>Idioma</strong><small>Altere o idioma da navegação.</small></div><select class="settings-select" data-setting-language><option value="pt" ${state.language === 'pt' ? 'selected' : ''}>Português</option><option value="en" ${state.language === 'en' ? 'selected' : ''}>English</option></select></div><div class="setting-row"><div><strong>Texto maior</strong><small>Aumenta a escala tipográfica para leitura.</small></div><label class="switch"><input type="checkbox" data-setting="largeText" ${checked(state.accessibility.largeText)}><span></span></label></div><div class="setting-row"><div><strong>Alto contraste</strong><small>Reforça as diferenças entre fundo e texto.</small></div><label class="switch"><input type="checkbox" data-setting="highContrast" ${checked(state.accessibility.highContrast)}><span></span></label></div><div class="setting-row"><div><strong>Reduzir movimento</strong><small>Desliga animações não essenciais.</small></div><label class="switch"><input type="checkbox" data-setting="reducedMotion" ${checked(state.accessibility.reducedMotion)}><span></span></label></div><div class="settings-profile"><span class="settings-profile-icon">L</span><div><strong>${escapeHtml(state.profile.name)}</strong><small>${escapeHtml(state.profile.email)}</small></div><button class="text-link" data-action="profile-from-settings">Editar perfil <span>→</span></button></div></div><div class="modal-footer"><button class="outline-button" data-action="close-modal">Voltar</button><button class="primary-button" data-action="save-settings">Guardar preferências <span>→</span></button></div>`);
}

function openChat() {
  const current = $('.chat-window');
  if (current) { current.remove(); return; }
  const chat = document.createElement('aside');
  chat.className = 'chat-window';
  chat.innerHTML = `<div class="chat-head"><div class="chat-agent"><span>✦</span><div><strong>Impacta+ Assistente</strong><small><i></i> Disponível agora</small></div></div><button class="modal-close" data-action="close-chat" aria-label="Fechar chat">×</button></div><div class="chat-messages" id="chat-messages"><div class="chat-message assistant">Olá, Lucca. Sou o assistente do Impacta+. Posso ajudar a encontrar uma conexão, explicar um indicador ou orientar você pela sua jornada.</div><div class="chat-suggestions"><button data-chat-prompt="Como aumento meu Impact Score?">Aumentar meu score</button><button data-chat-prompt="Quais oportunidades são prioritárias?">Ver prioridades</button></div></div><form class="chat-form" id="chat-form"><input name="message" autocomplete="off" placeholder="Escreva uma mensagem..." required /><button type="submit" aria-label="Enviar mensagem">↑</button></form>`;
  document.body.append(chat);
  chat.querySelector('input')?.focus();
}

function chatReply(message) {
  const normalized = message.toLowerCase();
  if (normalized.includes('score') || normalized.includes('ponto')) return 'Para subir o seu Impact Score, comece por concluir a missão de nova conexão e actualize um marco na sua linha do tempo. Cada acção alimenta uma leitura mais completa da sua rede.';
  if (normalized.includes('oportun') || normalized.includes('prior')) return 'Hoje, a rota de plástico reciclado tem maior urgência e 94% de compatibilidade. Também há uma oportunidade social ligada à compostagem. Quer que eu abra o radar?';
  if (normalized.includes('conex') || normalized.includes('empresa')) return 'Posso levar você à rede de conexões. Lá, use a busca por cidade ou material e abra “Ver informações” para conhecer cada organização antes de iniciar uma conversa.';
  if (normalized.includes('relat') || normalized.includes('impact')) return 'Na área Impacto, o botão “Baixar relatório” prepara um resumo simulado com score, emissões evitadas, circularidade e marcos recentes.';
  return 'Entendi. Posso ajudar com conexões, oportunidades, impacto, ranking ou a sua Jornada. Diga-me qual destes caminhos você quer explorar.';
}

function appendChatMessage(text, type) {
  const messages = $('#chat-messages');
  if (!messages) return;
  const item = document.createElement('div'); item.className = `chat-message ${type}`; item.textContent = text; messages.insertBefore(item, messages.querySelector('.chat-suggestions')); messages.scrollTop = messages.scrollHeight;
}

function downloadReport() {
  const date = new Date().toLocaleDateString(state.language === 'en' ? 'en-US' : 'pt-BR');
  const report = `<!doctype html><html lang="${state.language === 'en' ? 'en' : 'pt-BR'}"><head><meta charset="utf-8"><title>Relatório Impacta+ — ${date}</title><style>body{font-family:Arial,sans-serif;color:#102a43;max-width:760px;margin:48px auto;padding:0 24px}h1{font-size:32px}h2{margin-top:32px;color:#079c98}header{border-bottom:3px solid #16c6b4;padding-bottom:20px}.metric{display:inline-block;width:30%;padding:18px 1%;vertical-align:top}.metric strong{display:block;font-size:24px}.note{padding:16px;background:#eaf9f4;border-left:4px solid #16c6b4}</style></head><body><header><h1>Impacta+</h1><p>Relatório simulado de inteligência de impacto · ${date}</p></header><h2>Resumo executivo</h2><p>Este relatório reúne os principais sinais do workspace Orbe Circular e transforma actividade de rede em leitura de impacto.</p><div class="metric"><small>Impact Score</small><strong>742/1000</strong></div><div class="metric"><small>Resíduos reaproveitados</small><strong>12.840 kg</strong></div><div class="metric"><small>CO₂ evitado</small><strong>8.420 kg</strong></div><h2>Marcos recentes</h2><div class="note"><strong>+42 pts</strong> — 1.200 kg de papel redireccionados para a Cooperativa ReciclaSul.<br><strong>+28 pts</strong> — Nova parceria com EcoMobi.<br><strong>+64 pts</strong> — Meta mensal de circularidade alcançada.</div><h2>Próximos sinais</h2><p>O Impacta+ detectou uma oportunidade prioritária de plástico reciclado e recomenda ampliar a capacidade de compostagem nas próximas semanas.</p></body></html>`;
  const blob = new Blob([report], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'relatorio-impacta-plus.html'; link.click(); URL.revokeObjectURL(link.href); toast('Relatório simulado descarregado.');
}

function completeMission(mission) {
  if (state.missions[mission]) { toast('Essa missão já está concluída.'); return; }
  state.missions[mission] = true; persist();
  const item = $(`.mission-item[data-mission="${mission}"]`);
  if (item) { item.classList.add('completed'); const action = $('.mission-action', item); if (action) { action.disabled = true; action.textContent = '✓'; } const progress = $('.mission-progress span', item); if (progress) progress.style.width = '100%'; }
  const completed = Object.keys(state.missions).length + 1;
  if ($('#missions-count')) $('#missions-count').textContent = `${Math.min(completed, 3)}/3 concluídas`;
  if ($('#journey-xp')) $('#journey-xp').innerHTML = `${(1720 + (completed === 2 ? 40 : 60)).toLocaleString('pt-BR')} <small>/ 2.000 pts</small>`;
  toast(`Missão concluída. Você ganhou ${mission === 'connect' ? 40 : 60} pontos.`);
}

function rankingModal() {
  openModal(`<div class="modal-head"><div><span class="eyebrow teal">DESAFIO DE POSIÇÃO</span><h3>Subir no ranking</h3></div><button class="modal-close" data-action="close-modal">×</button></div><div class="modal-body"><div class="insight-detail"><strong>Você está em #18 com 742 pts.</strong><br />A posição #15 está a 62 pontos. Três missões e uma nova rota podem mudar essa distância.</div><p>Escolha uma acção para activar um desafio de 7 dias. O desafio fica guardado no seu navegador para você acompanhar a evolução.</p></div><div class="modal-footer"><button class="outline-button" data-action="close-modal">Voltar</button><button class="primary-button" data-action="accept-ranking-challenge">Activar desafio <span>→</span></button></div>`);
}

function overrideAction(action, target) {
  switch (action) {
    case 'theme-toggle': state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); toast(state.theme === 'dark' ? 'Modo escuro activado.' : 'Modo claro activado.'); break;
    case 'chat': openChat(); break;
    case 'close-chat': $('.chat-window')?.remove(); break;
    case 'settings': settingsModal(); break;
    case 'save-settings': closeModal(); applyTheme(); applyLanguage(); toast('Preferências guardadas no navegador.'); break;
    case 'profile-from-settings': closeModal(); showSection('perfil'); break;
    case 'download-report': downloadReport(); break;
    case 'signal-cycle': {
      const banner = $('.signal-banner-copy p'); if (banner) { const options = ['Encontramos 3 novos sinais conectando recursos, demandas e pessoas no seu workspace.', 'A sua rede tem 5 rotas activas com potencial de gerar impacto esta semana.', 'Há 4 organizações próximas prontas para transformar disponibilidade em oportunidade.']; const current = options.indexOf(banner.textContent); banner.textContent = options[(current + 1) % options.length]; } toast('Leitura do sinal actualizada.'); break;
    }
    case 'run-radar': target.disabled = true; target.innerHTML = 'A actualizar...'; window.setTimeout(() => { target.disabled = false; target.innerHTML = 'Actualizar radar <span>↻</span>'; toast('Radar actualizado: 4 novas oportunidades encontradas.'); }, 900); break;
    case 'network-map': openModal(`<div class="modal-head"><div><span class="eyebrow teal">MAPA DA REDE</span><h3>As suas conexões em movimento.</h3></div><button class="modal-close" data-action="close-modal">×</button></div><div class="modal-body"><div class="network-map-preview"><span>Orbe Circular</span><i>●—●—●</i><small>247 conexões · 18 rotas activas · 82,4% de compatibilidade</small></div><p>Este mapa demonstra como recursos, demandas e organizações se conectam. Na versão com dados reais, a visualização poderá ser filtrada por material, distância e impacto.</p></div><div class="modal-footer"><button class="outline-button" data-action="close-modal">Voltar</button><button class="primary-button" data-action="map-focus">Focar no maior sinal <span>→</span></button></div>`); break;
    case 'import-connections': toast('Importação simulada pronta: seleccione um CSV na versão conectada.'); break;
    case 'connection-activity': openModal(`<div class="modal-head"><div><span class="eyebrow teal">ACTIVIDADE RECENTE</span><h3>Movimento da sua rede.</h3></div><button class="modal-close" data-action="close-modal">×</button></div><div class="modal-body"><p><strong>Hoje</strong> · EcoMobi actualizou a demanda por plástico reciclado.</p><p><strong>Ontem</strong> · ReciclaSul confirmou o recebimento de 1.200 kg de papel.</p><p><strong>28 Ago</strong> · Instituto Vértice entrou na sua rede.</p></div><div class="modal-footer"><button class="primary-button" data-action="close-modal">Fechar</button></div>`); break;
    case 'opportunity-guide': openModal(`<div class="modal-head"><div><span class="eyebrow teal">COMO PRIORIZAMOS</span><h3>O radar lê contexto, não só volume.</h3></div><button class="modal-close" data-action="close-modal">×</button></div><div class="modal-body"><p>As oportunidades recebem prioridade a partir de compatibilidade de material, distância, urgência, potencial de impacto e histórico de resposta da rede.</p><div class="insight-detail"><strong>Compatibilidade + proximidade + impacto = próxima acção</strong></div></div><div class="modal-footer"><button class="primary-button" data-action="close-modal">Entendi</button></div>`); break;
    case 'journey-challenge': showSection('jornada'); toast('Desafio da semana activado: faça uma nova conexão e ganhe 40 pts.'); break;
    case 'complete-mission': completeMission(target.dataset.mission); break;
    case 'rewards-info': case 'all-rewards': openModal(`<div class="modal-head"><div><span class="eyebrow teal">RECOMPENSAS DA JORNADA</span><h3>O impacto também se reconhece.</h3></div><button class="modal-close" data-action="close-modal">×</button></div><div class="modal-body"><p>Complete missões de conexão, impacto e inteligência para desbloquear distintivos. As recompensas são uma forma simples de tornar o progresso visível sem transformar impacto em competição vazia.</p><div class="insight-detail"><strong>Próxima recompensa: Aliança 100</strong><br />Faltam 280 pontos para desbloquear.</div></div><div class="modal-footer"><button class="primary-button" data-action="close-modal">Continuar jornada</button></div>`); break;
    case 'journey-history': toast('Histórico completo: +420 pts nos últimos 90 dias.'); break;
    case 'ranking-challenge': rankingModal(); break;
    case 'accept-ranking-challenge': closeModal(); toast('Desafio activado: alcance 804 pts em 7 dias.'); break;
    case 'ranking-info': toast('O ranking combina dados ambientais, sociais e consistência de rede.'); break;
    case 'ranking-more': toast('Ranking expandido: você está a 62 pts do top 15.'); break;
    case 'map-focus': closeModal(); showSection('conexoes'); toast('Filtro de maior sinal activado.'); break;
    default: {
      if (typeof handleActionOriginal === 'function') handleActionOriginal(action, target);
    }
  }
}

const handleActionOriginal = handleActionBase;
function handleAction(action, target) { overrideAction(action, target); }

/* Captura em fase para fazer Fechar, Cancelar e Voltar funcionarem mesmo com o card modal a parar o bubbling. */
$('#modal-root').addEventListener('click', (event) => {
  const actionTarget = event.target.closest('[data-action]');
  if (actionTarget) { event.stopPropagation(); overrideAction(actionTarget.dataset.action, actionTarget); }
}, true);

$('#language-select').addEventListener('change', (event) => { state.language = event.target.value; applyLanguage(); applyLocalizedMarkup(); persist(); showSection(location.hash.replace('#', '') || 'dashboard', false); toast(state.language === 'en' ? 'English interface enabled.' : 'Interface em português activada.'); });

document.addEventListener('change', (event) => {
  const theme = event.target.closest('[data-setting-theme]');
  if (theme) { state.theme = theme.dataset.settingTheme; applyTheme(); $$('.segmented-control button').forEach((button) => button.classList.toggle('active', button === theme)); }
  const language = event.target.closest('[data-setting-language]');
  if (language) { state.language = language.value; applyLanguage(); applyLocalizedMarkup(); }
  const setting = event.target.closest('[data-setting]');
  if (setting) { state.accessibility[setting.dataset.setting] = setting.checked; applyTheme(); }
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'chat-form') { event.preventDefault(); const input = event.target.elements.message; const text = input.value.trim(); if (!text) return; appendChatMessage(text, 'user'); input.value = ''; window.setTimeout(() => appendChatMessage(chatReply(text), 'assistant'), 420); }
});

document.addEventListener('click', (event) => {
  const prompt = event.target.closest('[data-chat-prompt]');
  if (prompt) { const input = $('#chat-form input'); if (input) { input.value = prompt.dataset.chatPrompt; $('#chat-form').requestSubmit(); } }
  const rankFilter = event.target.closest('[data-rank-filter]');
  if (rankFilter) { $$('.ranking-tabs .filter-button').forEach((button) => button.classList.toggle('active', button === rankFilter)); toast(`Filtro ${rankFilter.textContent.trim()} aplicado ao ranking.`); }
  const signal = event.target.closest('[data-signal]');
  if (signal) { const messages = { network: 'Sinal de rede: 12 organizações activas nesta leitura.', impact: 'Sinal de impacto: a meta anual está 74% concluída.', community: 'Sinal social: 184 pessoas alcançadas pela sua rede.', resource: 'Sinal de recurso: há materiais disponíveis para uma nova rota.', demand: 'Sinal de demanda: a EcoMobi procura 850 kg de plástico reciclado.' }; toast(messages[signal.dataset.signal] || 'Sinal actualizado.'); return; }
  const radar = event.target.closest('[data-opportunity-radar]');
  if (radar) { const descriptions = { 1: 'Sinal de alta prioridade: rota de plástico reciclado.', 2: 'Sinal de comunidade: parceria social em expansão.', 3: 'Sinal de circularidade: capacidade de compostagem disponível.' }; toast(descriptions[radar.dataset.opportunityRadar]); }
});

const localizedMarkup = {
  pt: {
    '.signal-banner h3': 'O próximo impacto<br /><em>já está nos seus dados.</em>',
    '.signal-banner p': 'Encontramos 3 novos sinais conectando recursos, demandas e pessoas no seu workspace.',
    '#section-dashboard .section-intro h2': 'Boa tarde, Lucca<span class="wave">✳</span>',
    '#section-dashboard .section-intro p': 'Veja como seus dados estão se transformando em impacto.',
    '#section-conexoes .section-intro h2': 'Conexões que geram movimento.',
    '#section-oportunidades .section-intro h2': 'Há mais caminhos para explorar.',
    '#section-inteligencia .section-intro h2': 'Inteligência que encontra sinais.',
    '#section-impacto .section-intro h2': 'O que muda quando você conecta.',
    '#section-jornada .section-intro h2': 'Pequenas acções. Mudanças visíveis.',
    '#section-ranking .section-intro h2': 'Impacto em boa companhia.',
    '#section-perfil .section-intro h2': 'Perfil e preferências.',
    '[data-action="export"]': '<span>↓</span> Exportar relatório',
    '[data-action="network-map"]': 'Mapa da rede',
    '[data-action="import-connections"]': 'Importar lista',
    '[data-action="connection-activity"]': 'Ver actividade <span>→</span>',
    '[data-action="run-radar"]': 'Actualizar radar <span>↻</span>',
    '[data-action="journey-challenge"]': 'Aceitar desafio da semana <span>→</span>',
    '[data-action="download-report"]': '<span>↓</span> Baixar relatório',
    '.signal-detail-chip': 'Trocar leitura <span>↻</span>'
  },
  en: {
    '.signal-banner h3': 'The next impact<br /><em>is already in your data.</em>',
    '.signal-banner p': 'We found 3 new signals connecting resources, demands and people in your workspace.',
    '#section-dashboard .section-intro h2': 'Good afternoon, Lucca<span class="wave">✳</span>',
    '#section-dashboard .section-intro p': 'See how your data is turning into impact.',
    '#section-conexoes .section-intro h2': 'Connections that create movement.',
    '#section-oportunidades .section-intro h2': 'There are more paths to explore.',
    '#section-inteligencia .section-intro h2': 'Intelligence that finds signals.',
    '#section-impacto .section-intro h2': 'See what changes when you connect.',
    '#section-jornada .section-intro h2': 'Small actions. Visible change.',
    '#section-ranking .section-intro h2': 'Impact in good company.',
    '#section-perfil .section-intro h2': 'Profile and preferences.',
    '[data-action="export"]': '<span>↓</span> Export report',
    '[data-action="network-map"]': 'Network map',
    '[data-action="import-connections"]': 'Import list',
    '[data-action="connection-activity"]': 'View activity <span>→</span>',
    '[data-action="run-radar"]': 'Update radar <span>↻</span>',
    '[data-action="journey-challenge"]': 'Accept weekly challenge <span>→</span>',
    '[data-action="download-report"]': '<span>↓</span> Download report',
    '.signal-detail-chip': 'Change reading <span>↻</span>'
  }
};
function applyLocalizedMarkup() { Object.entries(localizedMarkup[state.language]).forEach(([selector, html]) => { const element = $(selector); if (element) element.innerHTML = html; }); }
const queryPreferences = new URLSearchParams(location.search);
if (queryPreferences.get('theme') === 'dark' || queryPreferences.get('theme') === 'light') state.theme = queryPreferences.get('theme');
if (queryPreferences.get('lang') === 'en' || queryPreferences.get('lang') === 'pt') state.language = queryPreferences.get('lang');
applyTheme();
applyLanguage();
applyLocalizedMarkup();

document.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-signal]')) { event.preventDefault(); event.target.closest('[data-signal]').click(); }
});
