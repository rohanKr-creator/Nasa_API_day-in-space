// NASA API key (provided)
// Load API key from environment variable
let apiKey = "";

if (typeof process !== "undefined" && process.env && process.env.NASA_API_KEY) {
  // Running in Node.js
  apiKey = process.env.NASA_API_KEY;
} else {
  // Running in browser: look for <meta> tag
  const metaKey = document.querySelector('meta[name="nasa-api-key"]');
  apiKey = metaKey ? metaKey.content : "";
}

if (!apiKey) {
  console.error("NASA API key is missing! Please set it in .env or index.html <meta>.");
}


// Helpers
const $ = s => document.querySelector(s);
const fmt = d => d.toISOString().slice(0,10);
const setTodayMax = () => { $('#date').max = fmt(new Date()); };
const setStatus = msg => $('#status').textContent = msg;

const toast = (msg, ms=2000) => {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), ms);
};

// Drawer
function openDrawer({badge, title, date, img, desc, credits, links=[]}){
  $('#detailsDrawer').classList.add('show');
  $('#detailsDrawer').setAttribute('aria-hidden','false');
  $('#drawerBadge').textContent = badge || '';
  $('#drawerTitle').textContent = title || 'Details';

  const body = $('#drawerBody');
  body.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'row';

  if(img){
    const im = document.createElement('img');
    im.src = img; im.alt = title || 'Image';
    row.appendChild(im);
  }

  const text = document.createElement('div');
  text.className = 'text';

  if(date){
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Date: ${date}`;
    text.appendChild(meta);
  }
  if(desc){
    const p = document.createElement('div');
    p.textContent = desc;
    text.appendChild(p);
  }
  if(credits){
    const c = document.createElement('div');
    c.style.opacity = '0.9';
    c.textContent = `Credits: ${credits}`;
    text.appendChild(c);
  }
  if(Array.isArray(links) && links.length){
    const wrap = document.createElement('div');
    links.forEach(({href,label})=>{
      const a = document.createElement('a');
      a.href = href; a.target='_blank'; a.rel='noopener noreferrer';
      a.textContent = label || href;
      a.className = 'link';
      a.style.display = 'inline-block';
      a.style.marginRight = '10px';
      wrap.appendChild(a);
    });
    text.appendChild(wrap);
  }

  row.appendChild(text);
  body.appendChild(row);
}
function closeDrawer(){
  $('#detailsDrawer').classList.remove('show');
  $('#detailsDrawer').setAttribute('aria-hidden','true');
}

// UI helpers
function addItem({title, date, img, badge, desc, link, details}){
  const card = document.createElement('div');
  card.className = 'item';

  if(img){
    const im = document.createElement('img');
    im.src = img; im.alt = title || 'Image'; im.className='thumb';
    card.appendChild(im);
  }

  const c = document.createElement('div');
  c.className = 'content';

  const head = document.createElement('div');
  head.innerHTML = `<span class="badge">${badge}</span>`;
  c.appendChild(head);

  const h3 = document.createElement('div');
  h3.style.fontWeight = '700';
  h3.textContent = title || '(untitled)';
  c.appendChild(h3);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = date || '';
  c.appendChild(meta);

  if(desc){
    const p = document.createElement('div');
    p.className = 'ellipsis';
    p.textContent = desc;
    c.appendChild(p);
  }

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';

  if(link){
    const a = document.createElement('a');
    a.href = link; a.target='_blank'; a.rel='noopener noreferrer';
    a.textContent = 'Open original';
    a.className = 'link';
    actions.appendChild(a);
  }

  if(details){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'details-btn';
    btn.textContent = 'Details';
    btn.addEventListener('click', ()=> openDrawer(details));
    actions.appendChild(btn);
  }

  c.appendChild(actions);
  card.appendChild(c);
  $('#results').appendChild(card);
}

function resetResults(){
  $('#results').innerHTML = '';
  $('#kpiTotal').textContent = '0';
  $('#kpiPhotos').textContent = '0';
  $('#kpiEvents').textContent = '0';
  $('#empty').style.display = 'none';
}
function updateKPIs(){
  const cards = Array.from(document.querySelectorAll('#results .item'));
  const photos = cards.filter(x => x.querySelector('img')).length;
  const events = cards.length;
  $('#kpiTotal').textContent = String(events);
  $('#kpiPhotos').textContent = String(photos);
  $('#kpiEvents').textContent = String(events);
  if(events === 0) $('#empty').style.display = 'block';
}

// NASA API
async function getAPOD(date){
  const url = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}&date=${encodeURIComponent(date)}`;
  const r = await fetch(url);
  if(!r.ok) throw new Error('APOD error ' + r.status);
  return r.json();
}
async function getEPIC(date){
  const url = `https://api.nasa.gov/EPIC/api/natural/date/${encodeURIComponent(date)}?api_key=${encodeURIComponent(apiKey)}`;
  const r = await fetch(url);
  if(r.status === 404) return [];
  if(!r.ok) throw new Error('EPIC error ' + r.status);
  return r.json();
}
async function getNEO(date){
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${encodeURIComponent(date)}&end_date=${encodeURIComponent(date)}&api_key=${encodeURIComponent(apiKey)}`;
  const r = await fetch(url);
  if(!r.ok) throw new Error('NEO error ' + r.status);
  return r.json();
}
function epicImageUrl(imageName, date){
  const [y,m,d] = date.split('-');
  return `https://api.nasa.gov/EPIC/archive/natural/${y}/${m}/${d}/png/${imageName}.png?api_key=${encodeURIComponent(apiKey)}`;
}

// Fetch for a day
async function fetchAllForDate(date){
  resetResults();
  setStatus('Fetching APOD, EPIC and NEO…');

  try{
    const [apod, epic, neo] = await Promise.allSettled([
      getAPOD(date),
      getEPIC(date),
      getNEO(date)
    ]);

    // APOD
    if(apod.status === 'fulfilled'){
      const a = apod.value;
      const isImg = a.media_type === 'image';
      addItem({
        title: a.title || 'APOD',
        date: a.date || date,
        img: isImg ? a.url : null,
        badge: 'APOD',
        desc: a.explanation || '',
        link: a.hdurl || a.url || null,
        details: {
          badge: 'APOD',
          title: a.title || 'Astronomy Picture of the Day',
          date: a.date || date,
          img: isImg ? (a.hdurl || a.url) : null,
          desc: a.explanation || '',
          credits: a.copyright || 'NASA / APOD',
          links: [
            a.hdurl ? {href:a.hdurl, label:'HD image'} : null,
            a.url ? {href:a.url, label:'APOD link'} : null
          ].filter(Boolean)
        }
      });
    }

    // EPIC
    if(epic.status === 'fulfilled' && Array.isArray(epic.value) && epic.value.length){
      epic.value.slice(0, 9).forEach(e => {
        const lat = e.centroid_coordinates && e.centroid_coordinates.lat;
        const lon = e.centroid_coordinates && e.centroid_coordinates.lon;
        const coordTxt = (typeof lat === 'number' && typeof lon === 'number')
          ? `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`
          : 'Earth from DSCOVR';
        const imgUrl = epicImageUrl(e.image, date);
        addItem({
          title: 'EPIC Earth Image',
          date: e.date || date,
          img: imgUrl,
          badge: 'EPIC',
          desc: `${coordTxt}${e.caption ? ' • ' + e.caption : ''}`,
          link: 'https://epic.gsfc.nasa.gov/',
          details: {
            badge: 'EPIC',
            title: 'EPIC Earth Image',
            date: e.date || date,
            img: imgUrl,
            desc: e.caption || 'Earth from DSCOVR (EPIC)',
            credits: 'NASA EPIC / DSCOVR',
            links: [{href:'https://epic.gsfc.nasa.gov/', label:'EPIC Portal'}]
          }
        });
      });
    }

    // NEO (events, no image)
    if(neo.status === 'fulfilled'){
      const list = (neo.value && neo.value.near_earth_objects && neo.value.near_earth_objects[date]) || [];
      list.slice(0, 9).forEach(obj => {
        const approach = (obj.close_approach_data && obj.close_approach_data[0]) || {};
        const miss = approach.miss_distance ? Number(approach.miss_distance.kilometers).toLocaleString() + ' km' : '—';
        const vel = approach.relative_velocity ? Number(approach.relative_velocity.kilometers_per_hour).toLocaleString() + ' km/h' : '—';
        const dmin = obj.estimated_diameter && obj.estimated_diameter.meters && obj.estimated_diameter.meters.estimated_diameter_min;
        const dmax = obj.estimated_diameter && obj.estimated_diameter.meters && obj.estimated_diameter.meters.estimated_diameter_max;
        const dia = (typeof dmin === 'number' && typeof dmax === 'number') ? `${dmin.toFixed(0)}–${dmax.toFixed(0)} m` : '—';

        addItem({
          title: obj.name,
          date: approach.close_approach_date_full || approach.close_approach_date || date,
          img: null,
          badge: obj.is_potentially_hazardous_asteroid ? 'NEO • Hazard' : 'NEO',
          desc: `Est. dia: ${dia} • Miss: ${miss} • Speed: ${vel}`,
          link: obj.nasa_jpl_url || null
        });
      });
    }

    updateKPIs();
    setStatus('Done.');
  }catch(err){
    console.error(err);
    toast('Error: ' + (err.message || 'Failed to fetch data'));
    setStatus('Failed to fetch. Try another date.');
  }
}

// Init
function init(){
  setTodayMax();
  const today = fmt(new Date());
  $('#date').value = today;

  $('#fetchBtn').addEventListener('click', ()=>{
    const v = $('#date').value;
    if(!v){ toast('Pick a date.'); return; }
    fetchAllForDate(v);
  });

  $('#todayBtn').addEventListener('click', ()=>{
    const t = fmt(new Date());
    $('#date').value = t;
    fetchAllForDate(t);
  });

  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#detailsDrawer').addEventListener('click', (e)=>{
    if(e.target === e.currentTarget) closeDrawer();
  });

  // Auto-fetch for today on load
  fetchAllForDate(today);
}

document.addEventListener('DOMContentLoaded', init);
