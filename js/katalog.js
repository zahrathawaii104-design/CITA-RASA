const $ = (s, r = document) => r.querySelector(s);
const rp = n => 'Rp' + Number(n || 0).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toList = t => String(t || '').split(/\n|,/).map(x => x.trim()).filter(Boolean);
const NOTE = 'Harga Awal - Harga final dikonfirmasi pemilik';

// Contoh data awal (tampil hanya jika Supabase belum dikonfigurasi)
const SAMPLE = {
  'nasi-box': [
    {id:1,name:'Nasi Box Standard',price:18000,price_unit:'Per box',description:'Paket hemat untuk rapat & acara harian.',contents:'Nasi putih\nAyam\nBihun/mi\nCapcay\nKerupuk'},
    {id:2,name:'Nasi Box Premium',price:25000,price_unit:'Per box',description:'Lauk lebih lengkap untuk acara istimewa.',contents:'Nasi putih\nRendang\nKentang\nCapcay\nBihun/mi\nKerupuk'}],
  prasmanan: [
    {id:3,name:'Prasmanan Standard',price:35000,price_unit:'Per orang',description:'Hidangan prasmanan lengkap.',contents:'Nasi putih\nAyam\nKentang\nBihun/mi\nSup ayam/capcay\nKerupuk'},
    {id:4,name:'Prasmanan Premium',price:50000,price_unit:'Per orang',description:'Menu prasmanan dengan rendang & karedok.',contents:'Nasi putih\nRendang\nKentang\nBihun/mi\nSup ayam\nKaredok\nKerupuk'}]
};

async function getMenus(slug) {
  if (!configured) return SAMPLE[slug] || [];
  const { data: cat } = await sb.from('categories').select('id').eq('slug', slug).eq('is_active', true).maybeSingle();
  if (!cat) return [];
  const { data, error } = await sb.from('menus').select('*').eq('category_id', cat.id).eq('is_active', true).order('price');
  if (error) throw error;
  return data || [];
}

const mark = () => `<span class="mark"><img src="assets/images/logo.png" alt="" onerror="this.parentNode.classList.add('noimg');this.remove()"><i>${esc(BRAND.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase())}</i></span>`;

function layout() {
  const p = document.body.dataset.page;
  const a = k => p === k ? ' class="active"' : '';
  const wa = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Assalamu\'alaikum, saya ingin bertanya mengenai katering.')}`;
  $('#site-header').outerHTML = `<header class="hdr"><div class="wrap">
    <a class="logo" href="index.html">${mark()}<span>${esc(BRAND)}</span></a>
    <button class="burger" aria-label="Buka menu" aria-expanded="false">☰</button>
    <nav class="nav" id="nav"><a href="index.html"${a('home')}>Beranda</a><a href="nasi-box.html"${a('nasi')}>Nasi Box</a><a href="prasmanan.html"${a('prasmanan')}>Prasmanan</a><a href="tentang-kami.html"${a('tentang')}>Tentang Kami</a>
    <a class="btn wa" href="${wa}" target="_blank" rel="noopener">WhatsApp</a></nav></div></header>`;
  $('#site-footer').outerHTML = `<footer class="ftr"><div class="wrap">
    <div><div class="fb">${mark()}<b>${esc(BRAND)}</b></div>Nasi box & katering prasmanan untuk setiap momen.</div>
    <div><a href="nasi-box.html">Nasi Box</a><br><a href="prasmanan.html">Prasmanan</a><br><a href="tentang-kami.html">Tentang Kami</a></div>
    <div><a href="${wa}" target="_blank" rel="noopener">Chat WhatsApp</a><br>© ${new Date().getFullYear()} ${esc(BRAND)}</div></div></footer>`;
  const b = $('.burger'), n = $('#nav');
  b.onclick = () => b.setAttribute('aria-expanded', n.classList.toggle('open'));
}

const fb = m => /box/i.test(m.price_unit || '') ? 'menu-nasibox.svg' : 'menu-prasmanan.svg';
const thumb = (m, badge) => `<div class="thumb">${badge ? `<span class="badge">${badge}</span>` : ''}<img src="${esc(m.image_url || 'assets/images/' + fb(m))}" alt="${esc(m.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/${fb(m)}'"></div>`;
const items = m => `<ul class="contents">${toList(m.contents).map(c => `<li>${esc(c)}</li>`).join('')}</ul>`;
const unit = m => esc((m.price_unit || '').toLowerCase());

function cardNasi(m) {
  return `<article class="card" data-name="${esc(m.name)}" data-price="${m.price}">${thumb(m)}<div class="body">
    <h3>${esc(m.name)}</h3><div class="price">${rp(m.price)} <small>/ ${unit(m) || 'box'}</small></div>
    <p>${esc(m.description)}</p>${items(m)}
    <label>Jumlah (box)<div class="qty"><input type="number" class="qty-in" min="1" inputmode="numeric" placeholder="0" aria-label="Jumlah box"></div></label>
    <div>Estimasi subtotal: <span class="sub-total">Rp0</span></div>
    <div class="note">${NOTE}</div>
    <button class="btn wa block btn-order">Pesan via WhatsApp</button></div></article>`;
}
function cardPras(m) {
  return `<article class="card">${thumb(m)}<div class="body">
    <h3>${esc(m.name)}</h3><div class="price"><small>Mulai dari</small> ${rp(m.price)} <small>/ ${unit(m) || 'orang'}</small></div>
    <p>${esc(m.description)}</p>${items(m)}<div class="note">${NOTE}</div>
    <a class="btn block pilih" href="#form-acara" data-name="${esc(m.name)}">Pilih Paket Ini</a></div></article>`;
}
function cardHome(m, i) {
  return `<article class="card">${thumb(m, i === 0 ? 'Paling dipesan' : '')}<div class="body"><h3>${esc(m.name)}</h3>
    <div class="price"><small>Mulai</small> ${rp(m.price)} <small>/ ${unit(m)}</small></div><div class="note">${NOTE}</div>
    <a class="btn ghost block" href="${m._p}">Lihat Paket</a></div></article>`;
}

async function renderCatalog(slug, el, fn) {
  el.innerHTML = '<div class="empty">Memuat paket…</div>';
  try {
    const ms = await getMenus(slug);
    window.__menus = ms;
    el.innerHTML = ms.length ? ms.map(fn).join('') : '<div class="empty">Paket belum tersedia. Hubungi kami via WhatsApp untuk info terbaru.</div>';
    document.dispatchEvent(new CustomEvent('katalog:ready', { detail: ms }));
  } catch (e) {
    console.error(e);
    el.innerHTML = '<div class="empty">Paket gagal dimuat. Muat ulang halaman atau hubungi kami via WhatsApp.</div>';
    document.dispatchEvent(new CustomEvent('katalog:ready', { detail: [] }));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  layout();
  const p = document.body.dataset.page;
  if (p === 'nasi') renderCatalog('nasi-box', $('#katalog'), cardNasi);
  if (p === 'prasmanan') renderCatalog('prasmanan', $('#katalog'), cardPras);
  if (p === 'home') {
    $('#galeri').innerHTML = [1, 2, 3, 4, 5, 6].map(n => `<div class="thumb"><img src="assets/images/galeri-${n}.jpg" alt="Hidangan Cita Rasa Ayah" loading="lazy" onerror="this.onerror=null;this.src='assets/images/galeri-${n}.svg'"></div>`).join('');
    try {
      const [a, b] = await Promise.all([getMenus('nasi-box'), getMenus('prasmanan')]);
      const all = [...a.map(m => ({ ...m, _p: 'nasi-box.html' })), ...b.map(m => ({ ...m, _p: 'prasmanan.html' }))].slice(0, 3);
      $('#unggulan').innerHTML = all.length ? all.map(cardHome).join('') : '<div class="empty">Paket segera hadir.</div>';
    } catch (e) { console.error(e); }
  }
});
