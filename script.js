
/* Simple CrazyGames-like demo app (all client-side, localStorage) */
const STORAGE_KEYS = { GAMES:'cg_games_v1', USERS:'cg_users_v1', NOTES:'cg_notes_v1', CUR:'cg_cur_v1' };
const defaults = {
  games: [
    {id:1,title:'Space Dash',thumb:'https://picsum.photos/seed/space/800/400',url:'#',desc:'Uzay temalı sonsuz koşu.'},
    {id:2,title:'Turbo Rally',thumb:'https://picsum.photos/seed/race/800/400',url:'#',desc:'Hızlı arcade yarış.'},
    {id:3,title:'Bubble Pop',thumb:'https://picsum.photos/seed/bubble/800/400',url:'#',desc:'Renkli balon patlatma.'}
  ],
  users: [
    {id:1,username:'admin',password:'1234',role:'admin'},
  ],
  notes: []
};

function $(id){return document.getElementById(id);}

function load(key, fallback){ try{ const s=localStorage.getItem(key); return s?JSON.parse(s):fallback; }catch(e){return fallback;} }
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

let games = load(STORAGE_KEYS.GAMES, defaults.games);
let users = load(STORAGE_KEYS.USERS, defaults.users);
let notes = load(STORAGE_KEYS.NOTES, defaults.notes);
let current = load(STORAGE_KEYS.CUR, null);

function init(){
  $('year').textContent = new Date().getFullYear();
  renderGames();
  bindUI();
  updateAuthUI();
}

function bindUI(){
  $('themeToggle').addEventListener('click', toggleTheme);
  $('loginBtn').addEventListener('click', showAuth);
  $('authClose').addEventListener('click', closeModals);
  $('authRegister').addEventListener('click', registerUser);
  $('authLogin').addEventListener('click', loginUser);
  $('authLogin').addEventListener('keydown', (e)=>e.key==='Enter' && loginUser());
  $('authRegister').addEventListener('keydown', (e)=>e.key==='Enter' && registerUser());
  $('addGameQuick').addEventListener('click', openAddGame);
  $('addGameSave').addEventListener('click', saveGame);
  $('addGameCancel').addEventListener('click', closeModals);
  $('logoutBtn').addEventListener('click', logout);
  $('saveNote').addEventListener('click', saveNote);
}

function toggleTheme(){
  document.documentElement.classList.toggle('dark');
  $('themeToggle').textContent = document.documentElement.classList.contains('dark')? '☀️ Açık' : '🌙 Gece';
}

function showAuth(){ $('modalBackdrop').style.display='block'; $('authModal').style.display='block'; $('authName').focus(); }
function openAddGame(){ $('modalBackdrop').style.display='block'; $('addGameModal').style.display='block'; $('gameTitle').focus(); }
function closeModals(){ $('modalBackdrop').style.display='none'; $('authModal').style.display='none'; $('addGameModal').style.display='none'; }

function registerUser(){
  const name = $('authName').value.trim();
  const pass = $('authPass').value.trim();
  const role = $('authRole').value || 'player';
  if(!name || !pass){ alert('Ad ve şifre gerekli'); return; }
  if(users.find(u=>u.username===name)){ alert('Bu kullanıcı adı alınmış'); return; }
  const id = Date.now();
  users.unshift({id,username:name,password:pass,role});
  save(STORAGE_KEYS.USERS, users);
  current = {id,username:name,role};
  save(STORAGE_KEYS.CUR, current);
  closeModals();
  updateAuthUI();
  alert('Kayıt başarılı — giriş yapıldı');
}

function loginUser(){
  const name = $('authName').value.trim();
  const pass = $('authPass').value.trim();
  const u = users.find(x=>x.username===name && x.password===pass);
  if(!u){ alert('Kullanıcı bulunamadı veya şifre hatalı'); return; }
  current = {id:u.id,username:u.username,role:u.role};
  save(STORAGE_KEYS.CUR, current);
  closeModals();
  updateAuthUI();
  alert('Giriş başarılı');
}

function logout(){
  current = null;
  localStorage.removeItem(STORAGE_KEYS.CUR);
  updateAuthUI();
}

function updateAuthUI(){
  if(current){
    $('welcome').textContent = `Hoşgeldin, ${current.username} (${current.role})`;
    $('loginBtn').style.display='none';
    $('logoutBtn').style.display='inline-block';
    if(current.role==='uploader' || current.role==='admin'){
      $('addGameQuick').style.display='inline-block';
    } else { $('addGameQuick').style.display='none'; }
    $('notesPanel').style.display = 'block';
    $('noteInput').value = '';
    renderNotes();
  } else {
    $('welcome').textContent = '';
    $('loginBtn').style.display='inline-block';
    $('logoutBtn').style.display='none';
    $('addGameQuick').style.display='none';
    $('notesPanel').style.display = 'none';
  }
}

function renderGames(){
  const container = $('gameGrid'); container.innerHTML='';
  games.forEach(g=>{
    const card = document.createElement('div'); card.className='card';
    const img = document.createElement('img'); img.src = g.thumb || 'https://picsum.photos/seed/'+g.id+'/800/400';
    const body = document.createElement('div'); body.className='card-body';
    body.innerHTML = `<div class="card-title">${escapeHtml(g.title)}</div><div class="muted" style="font-size:13px">${escapeHtml(g.desc||'')}</div>`;
    const row = document.createElement('div'); row.className='card-row';
    const play = document.createElement('button'); play.className='play-btn'; play.textContent='Oyna';
    play.onclick = ()=> window.open(g.url || '#','_blank');
    row.appendChild(play);

    if(current && current.role==='admin'){
      const del = document.createElement('button'); del.className='btn danger small'; del.textContent='Sil';
      del.onclick = ()=> { if(confirm('Silinsin mi?')){ games = games.filter(x=>x.id!==g.id); save(STORAGE_KEYS.GAMES,games); renderGames(); } };
      row.appendChild(del);
    }
    body.appendChild(row);
    card.appendChild(img); card.appendChild(body);
    container.appendChild(card);
  });
}

function saveGame(){
  const title = $('gameTitle').value.trim();
  const url = $('gameUrl').value.trim();
  const thumb = $('gameThumb').value.trim();
  if(!title || !url){ alert('Başlık ve URL gerekli'); return; }
  const id = Date.now();
  games.unshift({id,title,url,thumb,desc:''});
  save(STORAGE_KEYS.GAMES,games);
  closeModals();
  renderGames();
  alert('Oyun eklendi');
}

function saveNote(){
  const txt = $('noteInput').value.trim();
  if(!current){ alert('Not eklemek için giriş yapın'); return; }
  if(!txt){ alert('Boş not girilemez'); return; }
  const n = {id:Date.now(),user:current.username,content:txt,created:new Date().toISOString()};
  notes.unshift(n); save(STORAGE_KEYS.NOTES,notes); $('noteInput').value=''; renderNotes(); alert('Not kaydedildi'); 
}

function renderNotes(){
  const ul = $('notesList'); ul.innerHTML='';
  notes.forEach(n=>{ const li=document.createElement('li'); li.textContent = `${n.user}: ${n.content}`; ul.appendChild(li); });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m];}); }

init();
