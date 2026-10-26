const $ = (s, r = document) => r.querySelector(s);
const rp = n => 'Rp' + Number(n || 0).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugify = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const flash = (t, err) => { const m = $('#msg'); m.textContent = t; m.className = 'msg' + (err ? ' err' : ''); m.classList.remove('hide'); scrollTo(0, 0); };
const page = document.body.dataset.page;
let editId = null;

async function init() {
  if (!configured) { document.body.innerHTML = '<div class="wrap"><div class="panel">Isi SUPABASE_URL dan SUPABASE_ANON_KEY di js/supabase.js terlebih dahulu.</div></div>'; return; }
  const { data: { session } } = await sb.auth.getSession();
  if (page === 'login') {
    if (session) return location.replace('index.html');
    $('#f').onsubmit = async e => {
      e.preventDefault();
      const { error } = await sb.auth.signInWithPassword({ email: $('#email').value.trim(), password: $('#pw').value });
      error ? flash('Email atau password salah.', true) : location.replace('index.html');
    };
    return;
  }
  if (!session) return location.replace('login.html');
  $('#logout').onclick = async () => { await sb.auth.signOut(); location.replace('login.html'); };
  ({ dash, menu, kategori }[page])();
}

async function dash() {
  const [m, c] = await Promise.all([
    sb.from('menus').select('id', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true)]);
  $('#n-paket').textContent = m.count ?? 0; $('#n-kat').textContent = c.count ?? 0;
}

async function menu() {
  const { data: cats } = await sb.from('categories').select('*').order('sort_order');
  const cn = Object.fromEntries((cats || []).map(c => [c.id, c.name]));
  $('#category_id').innerHTML = (cats || []).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  const load = async () => {
    const { data, error } = await sb.from('menus').select('*').order('created_at', { ascending: false });
    if (error) return flash(error.message, true);
    window.__m = data;
    $('#rows').innerHTML = data.length ? data.map(m => `<tr><td>${m.image_url ? `<img src="${esc(m.image_url)}" alt="">` : '–'}</td>
      <td><b>${esc(m.name)}</b><br><small>${esc(cn[m.category_id] || '')}</small></td><td>${rp(m.price)}<br><small>${esc(m.price_unit)}</small></td>
      <td>${m.is_active ? 'Aktif' : 'Nonaktif'}</td>
      <td><button class="btn sm alt" data-e="${m.id}">Ubah</button><button class="btn sm del" data-d="${m.id}">Hapus</button></td></tr>`).join('')
      : '<tr><td colspan="5">Belum ada paket. Tambahkan lewat formulir di atas.</td></tr>';
  };
  const reset = () => { editId = null; $('#f').reset(); $('#is_active').checked = true; $('#prev').removeAttribute('src'); $('#ftitle').textContent = 'Tambah paket'; };
  $('#reset').onclick = reset;
  $('#f').onsubmit = async e => {
    e.preventDefault();
    const b = $('#save'); b.disabled = true;
    try {
      let image_url = $('#image_url').value || null;
      const file = $('#foto').files[0];
      if (file) {
        if (file.size > 3e6) throw new Error('Ukuran foto maksimal 3 MB.');
        const path = `${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;
        const up = await sb.storage.from('menu-images').upload(path, file, { contentType: file.type });
        if (up.error) throw up.error;
        image_url = sb.storage.from('menu-images').getPublicUrl(path).data.publicUrl;
      }
      const row = { name: $('#name').value.trim(), category_id: +$('#category_id').value, price: +$('#price').value, price_unit: $('#price_unit').value,
        description: $('#description').value.trim(), contents: $('#contents').value.trim(), image_url, is_active: $('#is_active').checked };
      const r = editId ? await sb.from('menus').update({ ...row, updated_at: new Date().toISOString() }).eq('id', editId) : await sb.from('menus').insert(row);
      if (r.error) throw r.error;
      flash('Paket disimpan.'); reset(); load();
    } catch (err) { flash(err.message, true); }
    b.disabled = false;
  };
  $('#rows').onclick = async e => {
    const id = e.target.dataset.e || e.target.dataset.d; if (!id) return;
    const m = window.__m.find(x => x.id == id);
    if (e.target.dataset.d) {
      if (!confirm(`Hapus paket "${m.name}"?`)) return;
      const { error } = await sb.from('menus').delete().eq('id', id);
      return error ? flash(error.message, true) : (flash('Paket dihapus.'), load());
    }
    editId = m.id; $('#ftitle').textContent = 'Ubah paket';
    for (const k of ['name', 'category_id', 'price', 'price_unit', 'description', 'contents']) $('#' + k).value = m[k] ?? '';
    $('#image_url').value = m.image_url || ''; if (m.image_url) $('#prev').src = m.image_url;
    $('#is_active').checked = m.is_active; scrollTo(0, 0);
  };
  load();
}

async function kategori() {
  const load = async () => {
    const { data, error } = await sb.from('categories').select('*').order('sort_order');
    if (error) return flash(error.message, true);
    window.__c = data;
    $('#rows').innerHTML = data.length ? data.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.slug)}</td><td>${c.sort_order}</td><td>${c.is_active ? 'Aktif' : 'Nonaktif'}</td>
      <td><button class="btn sm alt" data-e="${c.id}">Ubah</button><button class="btn sm del" data-d="${c.id}">Hapus</button></td></tr>`).join('')
      : '<tr><td colspan="5">Belum ada kategori.</td></tr>';
  };
  const reset = () => { editId = null; $('#f').reset(); $('#is_active').checked = true; $('#ftitle').textContent = 'Tambah kategori'; };
  $('#reset').onclick = reset;
  $('#name').oninput = () => { if (!editId) $('#slug').value = slugify($('#name').value); };
  $('#f').onsubmit = async e => {
    e.preventDefault();
    const row = { name: $('#name').value.trim(), slug: slugify($('#slug').value), sort_order: +$('#sort_order').value || 0, is_active: $('#is_active').checked };
    const r = editId ? await sb.from('categories').update(row).eq('id', editId) : await sb.from('categories').insert(row);
    r.error ? flash(r.error.message, true) : (flash('Kategori disimpan.'), reset(), load());
  };
  $('#rows').onclick = async e => {
    const id = e.target.dataset.e || e.target.dataset.d; if (!id) return;
    const c = window.__c.find(x => x.id == id);
    if (e.target.dataset.d) {
      if (!confirm(`Hapus kategori "${c.name}"? Paket di dalamnya ikut terhapus.`)) return;
      const { error } = await sb.from('categories').delete().eq('id', id);
      return error ? flash(error.message, true) : (flash('Kategori dihapus.'), load());
    }
    editId = c.id; $('#ftitle').textContent = 'Ubah kategori';
    for (const k of ['name', 'slug', 'sort_order']) $('#' + k).value = c[k];
    $('#is_active').checked = c.is_active; scrollTo(0, 0);
  };
  load();
}
document.addEventListener('DOMContentLoaded', init);
