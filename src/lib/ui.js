import { getLaunch, searchLaunches } from './api.js';
import { el } from './elements.js';

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el('form', { class: 'form' },
   el('input', { class: 'input', value: query ?? '', name: 'query'}),
   el('button', { class: 'button'}, 'Leit'));

  form.addEventListener('submit', searchHandler);

  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  let loadingEl = parentElement.querySelector('.loading');

  if (!loadingEl){
    loadingEl = el('p', { class: 'loading'}, 'Leita að niðurtstöðum...')
    parentElement.appendChild(loadingEl);
  }

  if (!searchForm){
    return;
  }
  const button = searchForm.querySelector('button');
  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  const loading = parentElement.querySelector('.loading');

  if (loading){
    loading.remove();
  }

  if(!searchForm){
    return;
  }

  const button = searchForm.querySelector('button[disabled]');

  if (button){
    button.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  const tafla = el('table', { class: 'searchResults'});
  if(!results){
    const noResultElement = el('tr', {}, 'Villa');
    tafla.appendChild(noResultElement);
  }

  if (results.length === 0){
    const noResultElement = el('tr', {}, 'Engar niðurstöður');
    tafla.appendChild(noResultElement);
  }

  const taflaHeader = el('tr', { class: 'resultHeader'},'Niðurstöður úr leit!');
  
  tafla.appendChild(taflaHeader);
  for (const result of results){
    const resultElement = el('td', { class: 'result'},
    el('a', { class:'name', href:''}, 'Nafn: ' , result.name, ' ---- '),
    el('span', { class:'status'}, 'Staða: ', result.status.name, ' ---- '),
    el('span', { class:'mission'}, 'Mission: ', result.mission)
    );

    tafla.appendChild(resultElement);
  }
  return tafla;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query) {
  const mainElement = parentElement.querySelector('main');

  if(!mainElement){
    console.warn('main element fannst ekki')
    return;
  }

  const resultElement = mainElement.querySelector('.searchResults');
  if (resultElement){
    resultElement.remove();
  }

  setLoading(mainElement, searchForm);
  const results = await searchLaunches(query);
  setNotLoading(mainElement, searchForm);

  const resultsEl = createSearchResults(results, query);

  mainElement.appendChild(resultsEl);
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderFrontpage(
  parentElement,
  searchHandler,
  query = undefined,
) {
  const heading = el('h1', { class: 'header'}, 'Geimskotaleitin 🚀');
  const searchForm = renderSearchForm(searchHandler, query);
  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);
}

/**
 * Sýna geimskot.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {
  setLoading(parentElement);
  const result = await getLaunch(id);
  setNotLoading(parentElement);

  if (!result){
    const noResultElement = el('tr', 
    {}, 'Villa');
    parentElement.appendChild(noResultElement);
    return;
  }
  
  const container = el('main', { class:'detailMain' }, 
  el('h1', { class:'launchName'}, `${result.name}`),
  el('span', { class:'startTime'}, `${result.window_start}`),
  el('span', { class: 'endTime'}, `${result.window_end}`),
  el('span', { class: 'resultName'}, `${result.name}`),
  el('span', {  class:'resultMissionName'}, `${result.mission}`),
  el('img'), { class:'resultImg', src:`${result.image}`});


  const backElement = el(
    'div',
    { class: 'back' },
    el('a', { href: '/' }, 'Til baka'),
  );

  parentElement.appendChild(container);
  container.appendChild(backElement);

  /* TODO setja loading state og sækja gögn */

  // Tómt og villu state, við gerum ekki greinarmun á þessu tvennu, ef við
  // myndum vilja gera það þyrftum við að skilgreina stöðu fyrir niðurstöðu

  /* TODO útfæra ef gögn */
}
