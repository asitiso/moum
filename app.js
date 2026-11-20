const byId = (id) => document.getElementById(id);
const create = (tag, className, content) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
};

const aiPharm = 'https://allaipharm.com/';
const providerTools = [
  ['guide', 'ai', '다국어 복약안내문', '환자용 안내문 작성', '文', 'aipharm_multilang_guide.php', '번역 복약지도'],
  ['labels', 'ai', '가격표 라벨 제작', '매대 가격표 만들기', '₩', 'aipharm_price_tag.php', '가격표시 인쇄'],
  ['products', 'ai', 'QR 제품 소개', '제품 안내 페이지 만들기', '▥', 'aipharm_product_intro.php', 'QR연동'],
  ['compare', 'ai', 'AI 의약품 성분 비교', '의약품 성분 비교', '⇄', 'aipharm_drug_comparison.php', '동일성분'],

  ['shortage', 'work', '공급중단 의약품', '공급중단·부족 품목 조회', '▦', 'aipharm_supply_suspend.php', '생산 수입 품절'],
  ['prices', 'work', '약가 인하·인상 조회', '변경된 보험 약가 찾기', '₩', 'aipharm_price_change_search.php', '약가변동'],
  ['marks', 'work', '식별표시 변경 조회', '최근 식별표시 변경 확인', '⌕', 'aipharm_identifier_change.php', '개정 변경정보'],
  ['pill', 'work', '낱알 식별', '모양과 표기로 의약품 찾기', '⊘', 'aipharm_pill_search.php', '알약 낱알식별'],
  ['canister', 'work', '캐니스터 호환 검사', '조제기 카세트 호환 비교', '⇄', 'aipharm_size_compare.php', '사이즈'],
  ['dur', 'work', 'DUR 점검', '의약품 안전사용 정보 확인', '+', 'aipharm_dur_check.php', '병용금기'],
  ['inventory', 'work', '재고 조사', '의약품 재고 조사 도구', '▥', 'aipharm_inventory_check.php', '재고관리'],
  ['copay', 'work', '본인부담금 계산기', '본인부담금 계산', '₩', 'aipharm_copay.php', '약제비'],
  ['syrup', 'work', '시럽 조제 환산계수', '시럽 조제 환산계수 계산', '÷', 'aipharm_powder_conversion.php', '환산 계량'],
  ['payroll', 'work', '월 급여 계산기', '근무자 월 급여 계산', '₩', 'aipharm_payroll.php', '급여 월급'],
  ['returns', 'work', '반품 기록부', '반품 내역 기록 · AI팜 계정 필요', '↶', 'aipharm_return_log.php', '반품관리'],
  ['order', 'work', 'AI 주문', '도매상 주문 · AI팜 계정 필요', '↗', '/ai_order.php', '도매 주문 장바구니'],
  ['scanner', 'work', '약품 스캔', '의약품 포장 바코드 읽기', '▥', 'aipharm_medicine_scanner.php', '바코드'],
  ['manager', 'work', 'AI팜 매니저', 'PC용 프로그램 안내', '▣', 'aipharm_manager_download.php', '다운로드'],

  ['statement', 'forms', '약국 간 거래명세서', '거래 내역 작성·인쇄', '▤', 'aipharm_transaction.php', '정산'],
  ['employment', 'forms', '재직증명서', '재직증명서 작성·인쇄', '▤', 'aipharm_employment_cert.php', '인사'],
  ['inspection', 'forms', '마약류 저장시설 점검표', '저장시설 점검 기록', '✓', 'aipharm_narcotic_inspection.php', '마약 점검'],
  ['consent', 'forms', '개인정보 제공 동의서', '동의서 작성·인쇄', '▤', 'aipharm_consent_form.php', '개인정보 수집'],
  ['contract', 'forms', '표준 근로계약서', '근로계약서 작성·인쇄', '▤', 'aipharm_labor_contract.php', '고용 노동'],
  ['payslip', 'forms', '임금명세서', '근무자 임금명세서 작성·인쇄', '▤', 'aipharm_payslip.php', '급여 명세서'],
].map(([id, group, name, desc, icon, path, keywords]) => ({
  id: 'tool:' + id,
  group,
  name,
  desc,
  icon,
  url: new URL(path, aiPharm + 'AI_PHARM/').href,
  keywords,
}));

const groupNames = {apps: '내 앱', ai: 'AI팜 · AI', work: 'AI팜 · 약국 업무', forms: 'AI팜 · 서식'};
const defaultFavorites = ['guide', 'prices', 'statement', 'shortage'].map((id) => 'tool:' + id);
const storageKeys = {
  apps: 'cenon-apps',
  pending: 'cenon-apps-pending',
  favorites: 'cenon-workspace-favorites',
  widgets: 'cenon-workspace-widgets',
  recent: 'cenon-workspace-recent',
};

function readList(key, fallback = []) {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    return Array.isArray(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function writeList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function appUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const text = value.trim();
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : 'https://' + text);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    return url.href;
  } catch {
    return '';
  }
}

function validApps(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => entry && ['string', 'number'].includes(typeof entry.id)
    && typeof entry.name === 'string' && entry.name.trim() && appUrl(entry.url));
}

let apps = validApps(readList(storageKeys.apps));
let pending = readList(storageKeys.pending).filter((entry) => entry && typeof entry.type === 'string');
let favorites = readList(storageKeys.favorites, defaultFavorites);
let recent = readList(storageKeys.recent);
let managingApps = false;
let managingFavorites = false;
let editingId = null;
let cloud = null;
let syncing = false;
let canSync = false;

function applyAppChange(list, change) {
  const index = list.findIndex((entry) => String(entry.id) === String(change.id));
  switch (change.type) {
    case 'add':
      return index < 0 && change.entry ? [...list, change.entry] : list;
    case 'edit':
      return list.map((item, i) => i === index ? {...item, ...change.entry} : item);
    case 'remove':
      return list.filter((_, i) => i !== index);
    case 'move': {
      const target = list.find((entry) => String(entry.id) === String(change.target));
      if (index === -1 || !target || list[index] === target) return list;
      const moved = list.slice();
      const [entry] = moved.splice(index, 1);
      moved.splice(moved.indexOf(target) + Number(change.after === true), 0, entry);
      return moved;
    }
    default:
      return list;
  }
}

function storeApps() {
  const pendingSaved = writeList(storageKeys.pending, pending);
  const appsSaved = writeList(storageKeys.apps, apps);
  return pendingSaved && appsSaved;
}

function setSyncStatus(text) {
  byId('sync-status').textContent = text;
}

function changeApps(change) {
  apps = applyAppChange(apps, change);
  pending.push(change);
  setSyncStatus(storeApps() ? '이 기기에 저장됨' : '이 기기에 저장할 수 없습니다.');
  renderCards();
  void syncPending();
}

async function syncPending() {
  if (!canSync || syncing || pending.length === 0) return;
  syncing = true;
  try {
    while (pending.length) {
      const batch = pending.slice();
      const shared = await cloud.update((list) => batch.reduce(applyAppChange, validApps(list)));
      pending.splice(0, batch.length);
      apps = pending.reduce(applyAppChange, validApps(shared));
      storeApps();
      renderCards();
    }
    setSyncStatus('공유 목록과 동기화됨');
  } catch {
    setSyncStatus(storeApps() ? '공유 연결이 끊겨 이 기기에 저장됨' : '앱 목록을 저장할 수 없습니다.');
  } finally {
    syncing = false;
  }
}

async function loadSharedApps() {
  setSyncStatus('공유 목록 불러오는 중…');
  try {
    cloud = await import('./firebase-sync.js');
    const shared = validApps(await cloud.load());
    canSync = true;
    if (pending.length) {
      if (!syncing) await syncPending();
      return;
    }
    if (syncing) return;
    apps = shared;
    writeList(storageKeys.apps, apps);
    renderCards();
    setSyncStatus('공유 목록과 동기화됨');
  } catch {
    canSync = cloud !== null;
    if (pending.length && canSync) {
      await syncPending();
    } else {
      setSyncStatus('이 기기에 저장된 목록');
    }
  }
}

function allTools() {
  return [
    ...apps.map((entry) => ({
      ...entry,
      id: 'app:' + entry.id,
      appId: entry.id,
      url: appUrl(entry.url),
      group: 'apps',
      icon: '▦',
    })),
    ...providerTools,
  ];
}

function toolLink(tool, className, content) {
  const link = create('a', className, content);
  link.href = tool.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function control(label, text, className, handler) {
  const button = create('button', className, text);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.addEventListener('click', handler);
  return button;
}

function savePreference(key, value) {
  if (!writeList(key, value)) byId('announcement').textContent = '이 브라우저에 설정을 저장할 수 없습니다.';
}

function toggleFavorite(tool) {
  favorites = favorites.includes(tool.id)
    ? favorites.filter((id) => id !== tool.id)
    : [...favorites, tool.id];
  savePreference(storageKeys.favorites, favorites);
  renderCards();
}

function reorderList(list, id, target) {
  const from = list.indexOf(id);
  const to = list.indexOf(target);
  if (from < 0 || to < 0 || from === to) return list;
  const result = list.slice();
  result.splice(from, 1);
  result.splice(to, 0, id);
  return result;
}

function moveTool(view, id, target) {
  if (id === target) return;
  if (view === 'favorites') {
    favorites = reorderList(favorites, id, target);
    savePreference(storageKeys.favorites, favorites);
    renderCards();
  } else {
    const before = apps.findIndex((item) => 'app:' + item.id === id);
    const after = apps.findIndex((item) => 'app:' + item.id === target);
    if (before < 0 || after < 0) return;
    changeApps({type: 'move', id: apps[before].id, target: apps[after].id, after: before < after});
  }
}

let dragged = null;
function enableReorder(card, tool, view) {
  card.draggable = true;
  card.addEventListener('dragstart', (event) => {
    dragged = {id: tool.id, view};
    event.dataTransfer.setData('text/plain', tool.id);
    event.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', () => {
    dragged = null;
    card.classList.remove('dragging');
  });
  card.addEventListener('dragover', (event) => {
    if (dragged?.view === view && dragged.id !== tool.id) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      card.classList.add('drag-target');
    }
  });
  card.addEventListener('dragleave', (event) => {
    if (!card.contains(event.relatedTarget)) card.classList.remove('drag-target');
  });
  card.addEventListener('drop', (event) => {
    event.preventDefault();
    card.classList.remove('drag-target');
    if (dragged?.view !== view) return;
    const id = dragged.id;
    dragged = null;
    moveTool(view, id, tool.id);
  });
}

function renderCard(tool, view, tools, index) {
  const card = create('article', 'tool-card');
  card.dataset.toolId = tool.id;
  const link = toolLink(tool);
  link.setAttribute('aria-label', tool.name);
  link.draggable = false;
  const icon = create('span', 'tool-icon tone-' + tool.group, tool.icon);
  icon.setAttribute('aria-hidden', 'true');
  const copy = create('span', 'tool-copy');
  copy.append(create('span', 'tool-name', tool.name));
  if (tool.desc) copy.append(create('span', 'tool-desc', tool.desc));
  link.append(icon, copy);

  const selected = favorites.includes(tool.id);
  const star = control(tool.name + ' 즐겨찾기 ' + (selected ? '해제' : '추가'), selected ? '★' : '☆', 'icon-btn star', () => toggleFavorite(tool));
  star.dataset.action = 'favorite';
  star.setAttribute('aria-pressed', String(selected));
  card.append(link, star);

  const managing = (view === 'apps' && managingApps) || (view === 'favorites' && managingFavorites);
  if (managing) {
    enableReorder(card, tool, view);
    const actions = create('div', 'card-actions');
    for (const [action, text, position] of [['앞으로 이동', '←', index - 1], ['뒤로 이동', '→', index + 1]]) {
      const neighbor = tools[position];
      const button = control(tool.name + ' ' + action, text, 'btn', () => moveTool(view, tool.id, neighbor.id));
      button.dataset.action = action;
      button.title = action;
      button.disabled = !neighbor;
      actions.append(button);
    }
    if (view === 'apps') {
      const edit = control(tool.name + ' 수정', '수정', 'btn', () => openEditor(tool.appId));
      edit.dataset.action = 'edit';
      const remove = control(tool.name + ' 삭제', '삭제', 'btn danger', () => {
        if (!window.confirm(tool.name + ' 앱을 삭제할까요?')) return;
        favorites = favorites.filter((id) => id !== tool.id);
        savePreference(storageKeys.favorites, favorites);
        changeApps({type: 'remove', id: tool.appId});
      });
      remove.dataset.action = 'remove';
      actions.append(edit, remove);
    }
    card.append(actions);
  }
  return card;
}

function renderCards() {
  const focused = document.activeElement?.closest('.tool-card');
  const focusList = focused?.parentElement.id;
  const action = document.activeElement?.dataset.action;
  const tools = allTools();
  const byToolId = new Map(tools.map((tool) => [tool.id, tool]));
  const favoritesList = favorites.map((id) => byToolId.get(id)).filter(Boolean);
  const userApps = tools.filter((tool) => tool.group === 'apps');
  const views = [
    ['favorites', 'favorites-list', favoritesList, '도구의 별표를 눌러 즐겨찾기에 추가하세요.'],
    ['apps', 'app-list', userApps, '상단의 앱 추가를 눌러 쓰고 있는 웹앱을 등록하세요.'],
    ...['ai', 'work', 'forms'].map((group) => [group, group + '-list', tools.filter((tool) => tool.group === group)]),
  ];
  for (const [view, id, items, emptyText] of views) {
    const list = byId(id);
    list.replaceChildren(...(items.length
      ? items.map((item, index) => renderCard(item, view, items, index))
      : [create('p', 'empty', emptyText)]));
  }
  byId('app-count').textContent = userApps.length + '개';
  byId('manage-apps').hidden = !userApps.length;
  byId('manage-favorites').hidden = favoritesList.length < 2;
  if (focusList) {
    const card = [...byId(focusList).children].find((item) => item.dataset.toolId === focused.dataset.toolId);
    const button = [...(card?.querySelectorAll('button') ?? [])].find((item) => item.dataset.action === action);
    (button && !button.disabled ? button : card?.querySelector('a') ?? byId(focusList === 'favorites-list' ? 'find-tools' : 'add-app')).focus();
  }
}

function toggleManagement(id, mode, text) {
  byId(id).setAttribute('aria-pressed', String(mode));
  byId(id).textContent = mode ? '완료' : text;
  renderCards();
}
byId('manage-apps').addEventListener('click', () => {
  managingApps = !managingApps;
  toggleManagement('manage-apps', managingApps, '앱 관리');
});
byId('manage-favorites').addEventListener('click', () => {
  managingFavorites = !managingFavorites;
  toggleManagement('manage-favorites', managingFavorites, '순서 편집');
});

const editor = byId('app-dialog');
const editorForm = byId('app-form');
const urlField = byId('app-url');
const nameField = byId('app-name');
const descField = byId('app-desc');

function openEditor(id = null) {
  editingId = id;
  const entry = apps.find((item) => item.id === id);
  editorForm.reset();
  delete nameField.dataset.suggested;
  byId('app-error').textContent = '';
  byId('editor-title').textContent = entry ? '앱 수정' : '앱 추가';
  urlField.value = entry?.url ?? '';
  nameField.value = entry?.name ?? '';
  descField.value = entry?.desc ?? '';
  editor.showModal();
}

byId('add-app').addEventListener('click', () => openEditor());
urlField.addEventListener('blur', () => {
  const normalized = appUrl(urlField.value);
  if (!normalized || nameField.value || editingId !== null) return;
  const knownTool = providerTools.find((tool) => tool.url === normalized);
  if (knownTool) {
    nameField.value = knownTool.name;
    if (!descField.value) descField.value = knownTool.desc;
  } else {
    nameField.value = new URL(normalized).hostname.replace(/^www\./, '').split('.')[0].slice(0, 40);
    nameField.dataset.suggested = 'true';
  }
});
nameField.addEventListener('focus', () => {
  if (nameField.dataset.suggested) {
    nameField.select();
    delete nameField.dataset.suggested;
  }
});
editorForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = appUrl(urlField.value);
  const name = nameField.value.trim();
  if (!url || !name) {
    byId('app-error').textContent = '유효한 웹 주소와 앱 이름을 입력하세요.';
    (url ? nameField : urlField).focus();
    return;
  }
  const entry = {name, url, desc: descField.value.trim()};
  if (editingId === null) {
    const id = crypto.randomUUID();
    changeApps({type: 'add', id, entry: {id, ...entry}});
  } else {
    changeApps({type: 'edit', id: editingId, entry});
  }
  editor.close();
});

const lookup = byId('tool-dialog');
const query = byId('tool-query');
const lookupResults = byId('lookup-results');
const fold = (value) => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s·\/\-]+/g, '');

function renderLookup() {
  const text = fold(query.value);
  const tools = allTools();
  const found = text ? tools.filter((tool) => fold([tool.name, tool.desc, tool.keywords].join(' ')).includes(text))
    : recent.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
  byId('lookup-count').textContent = text ? found.length + '개 검색 결과' : found.length + '개 최근 사용 도구';
  lookupResults.replaceChildren();
  if (!found.length) {
    lookupResults.append(create('li', 'empty', text ? '일치하는 도구가 없습니다.' : '이름을 입력하면 내 앱과 업무 도구에서 찾습니다.'));
    return;
  }
  for (const tool of found) {
    const result = create('li');
    const link = toolLink(tool, '', tool.name);
    link.append(create('small', '', groupNames[tool.group]));
    link.addEventListener('click', () => {
      recent = [tool.id, ...recent.filter((id) => id !== tool.id)].slice(0, 8);
      savePreference(storageKeys.recent, recent);
      lookup.close();
    });
    result.append(link);
    lookupResults.append(result);
  }
}

function openLookup() {
  if (lookup.open) {
    query.focus();
    return;
  }
  if (document.querySelector('dialog[open]')) return;
  query.value = '';
  renderLookup();
  lookup.showModal();
}

byId('find-tools').addEventListener('click', openLookup);
query.addEventListener('input', renderLookup);
lookup.addEventListener('keydown', (event) => {
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    lookup.close();
    return;
  }
  const results = [...lookupResults.querySelectorAll('a')];
  if (event.target === query && event.key === 'Enter' && results.length) {
    event.preventDefault();
    results[0].click();
  }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !results.length) return;
  if (event.target !== query && !results.includes(event.target)) return;
  event.preventDefault();
  const current = results.indexOf(event.target);
  const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
  (results[next] ?? query).focus();
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openLookup();
  }
});

for (const button of document.querySelectorAll('[data-close]')) {
  button.addEventListener('click', () => button.closest('dialog').close());
}

const widgetNames = {calendar: '달력', deadline: '도매상 주문 마감', supply: '의약품 공급 소식'};
const widgetOptions = byId('widget-options');
const widgetDialog = byId('widget-dialog');
const widgetPanel = byId('widgets');
const widgetIds = Object.keys(widgetNames);
const storedWidgets = readList(storageKeys.widgets);
const widgetState = [...new Set([...storedWidgets.map((item) => item?.id).filter((id) => widgetIds.includes(id)), ...widgetIds])]
  .map((id) => ({id, visible: storedWidgets.find((item) => item?.id === id)?.visible !== false}));

function renderWidgets() {
  for (const {id, visible} of widgetState) {
    const widget = byId('widget-' + id);
    widget.hidden = !visible;
    widgetPanel.append(widget);
  }
  widgetPanel.hidden = widgetState.every((item) => !item.visible);
}

function preferencesChanged() {
  savePreference(storageKeys.widgets, widgetState);
  renderWidgets();
}

function showWidgetOptions(focusId) {
  widgetOptions.replaceChildren();
  for (const [index, item] of widgetState.entries()) {
    const label = create('label');
    const input = create('input');
    input.type = 'checkbox';
    input.checked = item.visible;
    input.id = 'show-' + item.id;
    input.addEventListener('change', () => {
      item.visible = input.checked;
      preferencesChanged();
    });
    label.append(input, widgetNames[item.id]);
    const row = create('div', 'widget-option');
    const controls = create('span', 'widget-controls');
    for (const [action, character, target] of [['위로 이동', '↑', index - 1], ['아래로 이동', '↓', index + 1]]) {
      const button = control(widgetNames[item.id] + ' ' + action, character, 'btn btn-small', () => {
        widgetState.splice(index, 1);
        widgetState.splice(target, 0, item);
        preferencesChanged();
        showWidgetOptions(button.id);
      });
      button.id = input.id + '-' + character;
      button.disabled = target < 0 || target >= widgetState.length;
      controls.append(button);
    }
    row.append(label, controls);
    widgetOptions.append(row);
  }
  if (focusId) {
    const button = byId(focusId);
    (button.disabled ? button.closest('.widget-option').querySelector('input') : button).focus();
  }
}

byId('widget-settings').addEventListener('click', () => {
  showWidgetOptions();
  widgetDialog.showModal();
});

const koreaDate = new Intl.DateTimeFormat('ko-KR', {dateStyle: 'full', timeZone: 'Asia/Seoul'});
const dateParts = new Intl.DateTimeFormat('en', {year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'Asia/Seoul'});
function kstDateParts() {
  return Object.fromEntries(dateParts.formatToParts().filter(({type}) => type !== 'literal')
    .map(({type, value}) => [type, Number(value)]));
}
const initialDate = kstDateParts();
let calendarDate = new Date(initialDate.year, initialDate.month - 1, 1);

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const today = kstDateParts();
  byId('today-line').textContent = koreaDate.format();
  byId('calendar-month').textContent = year + '년 ' + (month + 1) + '월';
  const days = [...'일월화수목금토'].map((day) => create('span', 'weekday', day));
  for (let index = 0; index < calendarDate.getDay(); index++) days.push(create('span'));
  const length = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= length; day++) {
    const node = create('time', '', day);
    node.dateTime = [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
    if (year === today.year && month + 1 === today.month && day === today.day) node.setAttribute('aria-current', 'date');
    days.push(node);
  }
  byId('calendar-days').replaceChildren(...days);
}
for (const [id, offset] of [['calendar-prev', -1], ['calendar-next', 1]]) {
  byId(id).addEventListener('click', () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1);
    renderCalendar();
  });
}

const medicineName = byId('medicine-name');
medicineName.addEventListener('input', () => medicineName.setCustomValidity(''));
medicineName.form.addEventListener('submit', (event) => {
  medicineName.value = medicineName.value.trim();
  if (!medicineName.value) {
    event.preventDefault();
    medicineName.setCustomValidity('의약품 이름을 입력하세요.');
    medicineName.reportValidity();
  }
});

function highlightSection() {
  const hash = location.hash || '#favorites';
  for (const link of document.querySelectorAll('.navigation nav a')) {
    if (link.hash === hash) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

window.addEventListener('hashchange', highlightSection);
window.addEventListener('online', () => {
  if (!canSync) void loadSharedApps();
  else if (pending.length) void syncPending();
});
renderCards();
renderWidgets();
renderCalendar();
highlightSection();
void loadSharedApps();
