import { libraries, searchLibraries } from './catalog.js';

const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  sparkles: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/><path d="m20 2 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 4v-3.5c0-1 .1-1.5-.5-2 3-.3 5.5-1.5 5.5-6A4.7 4.7 0 0 0 19 6c.3-1 .3-2-.1-3 0 0-1.2-.4-3.9 1a13 13 0 0 0-6 0C6.3 2.6 5.1 3 5.1 3c-.4 1-.4 2-.1 3a4.7 4.7 0 0 0-1 3.5c0 4.5 2.5 5.7 5.5 6-.6.5-.6 1.3-.5 2V21"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
};
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.code}</svg>`;
const $ = selector => document.querySelector(selector);
const state = { query: '', category: 'All libraries', language: 'All languages', sort: 'curated', view: 'discover', project: '', saved: [], compare: [] };

document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const categories = ['All libraries', ...new Set(libraries.map(lib => lib.category))];
$('#categories').innerHTML = categories.map((name, i) => `<button class="category ${i === 0 ? 'active' : ''}" aria-pressed="${i === 0}" data-category="${escapeHtml(name)}">${icon(i === 0 ? 'grid' : 'code')}${escapeHtml(name)}</button>`).join('');

function render() {
  const results = searchLibraries({ ...state, saved: state.view === 'collections' ? state.saved : null });
  if (state.sort === 'name') results.sort((a, b) => a.name.localeCompare(b.name));
  $('#results-count').innerHTML = `<strong>${results.length} libraries</strong> ${state.view === 'collections' ? 'in your collection' : state.project ? 'matching your project' : 'to build something great'}`;
  $('#catalog-title').innerHTML = state.view === 'collections' ? 'Your next ideas, collected<span>.</span>' : 'Find your next building block<span>.</span>';
  $('#library-grid').innerHTML = results.length ? results.map(lib => `<article class="library-card">
    <div class="card-top"><span class="library-mark" data-id="${lib.id}" style="color:${lib.color};background:${lib.bg}">${lib.mark}</span><button class="save-button ${state.saved.includes(lib.id) ? 'saved' : ''}" data-save="${lib.id}" aria-label="Save ${lib.name}" aria-pressed="${state.saved.includes(lib.id)}">${icon('bookmark')}</button></div>
    <button class="card-title" data-detail="${lib.id}">${lib.name}</button><p>${lib.description}</p><div class="tags">${lib.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
    <div class="card-bottom"><span><span class="category-dot"></span>${lib.category}</span><label class="compare-label"><input type="checkbox" data-compare="${lib.id}" ${state.compare.includes(lib.id) ? 'checked' : ''}> Compare</label></div>
  </article>`).join('') : `<div class="empty"><h3>No libraries here just yet.</h3><p>${state.view === 'collections' ? 'Save a library using its bookmark to keep it here.' : 'Try a broader search or a different category.'}</p><button class="button small" id="reset-filters">Explore all libraries ↗</button></div>`;
  document.querySelectorAll('[data-category]').forEach(button => { const active = button.dataset.category === state.category; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === state.view));
  $('#saved-count').textContent = state.saved.length;
  $('#compare-count').textContent = state.compare.length;
  $('#compare-tray').hidden = state.compare.length === 0;
  $('#open-compare').disabled = state.compare.length < 2;
}

$('#search').addEventListener('input', event => { state.query = event.target.value; render(); });
$('#language').addEventListener('change', event => { state.language = event.target.value; render(); });
$('#sort').addEventListener('change', event => { state.sort = event.target.value; render(); });
document.addEventListener('click', event => {
  const category = event.target.closest('[data-category]');
  if (category) { state.category = category.dataset.category; render(); }
  const view = event.target.closest('[data-view]');
  if (view) { state.view = view.dataset.view; render(); $('#discover').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (event.target.closest('#reset-filters')) resetFilters();
  if (event.target.closest('[data-finder]')) openFinder();
  const example = event.target.closest('[data-example]');
  if (example) { $('#project-description').value = example.dataset.example; $('#project-description').focus(); }
  if (event.target.closest('#clear-project')) resetFilters();
});
document.addEventListener('keydown', event => { if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !$('#modal').open) { event.preventDefault(); $('#search').focus(); } });

function openFinder() {
  showModal(`<div class="eyebrow muted">A GOOD PLACE TO START</div><h2 class="modal-title">What are you building?</h2><p class="modal-description">Tell us what your project needs. We’ll match it with relevant libraries from our curated catalog.</p><form id="finder-form"><label class="finder-label" for="project-description">Your project, in a few words</label><textarea id="project-description" required minlength="3" maxlength="600" placeholder="A React dashboard with charts, API data, and a signup form…">${escapeHtml(state.project)}</textarea><div class="finder-examples"><button type="button" data-example="A React dashboard with charts and API data">An analytics dashboard ↗</button><button type="button" data-example="A backend API with a SQL database and validation">A backend API ↗</button><button type="button" data-example="A calendar booking app with dates and forms">A booking app ↗</button></div><button class="button" type="submit">${icon('sparkles')} Find my building blocks ↗</button><p class="finder-note">Keyword-based matching across ${libraries.length} curated libraries. A starting point to explore, with no AI service or account required.</p></form>`, 'Find libraries for your project');
  $('#project-description').focus();
}
document.addEventListener('submit', event => {
  if (event.target.id !== 'finder-form') return;
  event.preventDefault();
  const description = $('#project-description').value.trim();
  if (description.length < 3) { $('#project-description').setCustomValidity('Describe your project in at least 3 characters.'); $('#project-description').reportValidity(); return; }
  resetFilters(); state.project = description;
  $('#project-banner').innerHTML = `<span>${icon('sparkles')} <strong>Your project:</strong> ${escapeHtml(description)}</span><button id="clear-project" aria-label="Clear project matching">×</button>`;
  $('#project-banner').hidden = false;
  render(); $('#modal').close(); $('#discover').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.addEventListener('input', event => { if (event.target.id === 'project-description') event.target.setCustomValidity(''); });

function resetFilters() {
  Object.assign(state, { query: '', category: 'All libraries', language: 'All languages', project: '', view: 'discover' });
  $('#search').value = ''; $('#language').value = 'All languages'; $('#project-banner').hidden = true;
  render();
}

// Collections stay on this device; gracefully support browsers that block storage.
try {
  const stored = JSON.parse(localStorage.getItem('libfy-saved') || '[]');
  if (Array.isArray(stored)) state.saved = stored.filter(id => libraries.some(lib => lib.id === id));
} catch { /* An unavailable or invalid collection starts empty. */ }

function notify(message) {
  $('#toast').textContent = message; $('#toast').classList.add('visible');
  clearTimeout(notify.timer); notify.timer = setTimeout(() => $('#toast').classList.remove('visible'), 2800);
}

let modalTrigger;
function showModal(content, label) {
  modalTrigger = document.activeElement;
  $('#modal-content').innerHTML = content;
  $('#modal').setAttribute('aria-label', label);
  $('#modal').showModal();
}
$('#close-modal').addEventListener('click', () => $('#modal').close());
$('#modal').addEventListener('click', event => { if (event.target === $('#modal')) { const rect = $('#modal').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#modal').close(); } });
$('#modal').addEventListener('close', () => { if (modalTrigger?.isConnected) modalTrigger.focus(); });

document.addEventListener('click', async event => {
  const save = event.target.closest('[data-save]');
  if (save) {
    const id = save.dataset.save;
    state.saved = state.saved.includes(id) ? state.saved.filter(item => item !== id) : [...state.saved, id];
    try { localStorage.setItem('libfy-saved', JSON.stringify(state.saved)); }
    catch { notify('Saved for this visit. Browser storage is unavailable.'); }
    render();
    document.querySelector(`[data-save="${id}"]`)?.focus();
  }
  const detail = event.target.closest('[data-detail]');
  if (detail) {
    const lib = libraries.find(item => item.id === detail.dataset.detail);
    showModal(`<div class="detail-header"><span class="library-mark" style="color:${lib.color};background:${lib.bg}">${lib.mark}</span><div><div class="eyebrow muted">${lib.category}</div><h2>${lib.name}</h2></div></div><p class="modal-description">${lib.description}</p><div class="tags">${lib.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div><div class="detail-section"><h3>A good fit for</h3><p>${lib.fit}</p><h3>Keep in mind</h3><p>${lib.tradeoff}</p></div><div class="install"><code>${lib.install}</code><button data-copy="${lib.id}">Copy command</button></div><div class="detail-actions"><a class="button small" href="${lib.url}" target="_blank" rel="noopener">Official documentation ↗</a></div><p class="finder-note">Install command shown for ${lib.id === 'tanstack-query' || lib.id === 'lucide' ? 'React' : lib.ecosystem}. Check official docs for setup and compatibility.</p>`, `${lib.name} library details`);
  }
  const copy = event.target.closest('[data-copy]');
  if (copy) {
    const lib = libraries.find(item => item.id === copy.dataset.copy);
    try { await navigator.clipboard.writeText(lib.install); copy.textContent = 'Copied ✓'; }
    catch { copy.textContent = 'Select the command to copy'; }
  }
});

document.addEventListener('change', event => {
  const checkbox = event.target.closest('[data-compare]');
  if (!checkbox) return;
  const id = checkbox.dataset.compare;
  if (checkbox.checked && state.compare.length >= 3) { checkbox.checked = false; notify('Compare up to 3 libraries at a time.'); return; }
  state.compare = checkbox.checked ? [...state.compare, id] : state.compare.filter(item => item !== id);
  render(); document.querySelector(`[data-compare="${id}"]`)?.focus();
});
$('#clear-compare').addEventListener('click', () => { state.compare = []; render(); });
$('#open-compare').addEventListener('click', () => {
  const selected = state.compare.map(id => libraries.find(lib => lib.id === id));
  const rows = [['Category', 'category'], ['Ecosystem', 'ecosystem'], ['Approach', 'approach'], ['Best for', 'fit'], ['Consideration', 'tradeoff']];
  showModal(`<div class="eyebrow muted">SIDE BY SIDE</div><h2 class="modal-title">Good choices start here.</h2><p class="modal-description">Find the right fit for your project’s needs.</p><div class="table-scroll"><table class="compare-table"><thead><tr><th scope="col">Library</th>${selected.map(lib => `<th scope="col">${lib.name}</th>`).join('')}</tr></thead><tbody>${rows.map(([title, key]) => `<tr><th scope="row">${title}</th>${selected.map(lib => `<td>${lib[key]}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Explore</th>${selected.map(lib => `<td><a href="${lib.url}" target="_blank" rel="noopener">Official docs ↗</a></td>`).join('')}</tr></tbody></table></div>`, 'Compare libraries');
});

render();
