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
});
document.addEventListener('keydown', event => { if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !$('#modal').open) { event.preventDefault(); $('#search').focus(); } });

function resetFilters() {
  Object.assign(state, { query: '', category: 'All libraries', language: 'All languages', project: '', view: 'discover' });
  $('#search').value = ''; $('#language').value = 'All languages'; $('#project-banner').hidden = true;
  render();
}

render();
