-- Jalankan di Supabase > SQL Editor
create table public.categories(
  id bigint generated always as identity primary key,
  name text not null, slug text not null unique,
  sort_order int not null default 0, is_active boolean not null default true);
create table public.menus(
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories(id) on delete cascade,
  name text not null, description text, price integer not null check (price>=0),
  price_unit text not null default 'Per box' check (price_unit in ('Per box','Per orang','Per paket')),
  contents text, image_url text, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

alter table public.categories enable row level security;
alter table public.menus enable row level security;

create policy "public baca kategori aktif" on public.categories for select to anon using (is_active);
create policy "public baca menu aktif" on public.menus for select to anon using (is_active);
create policy "admin baca kategori" on public.categories for select to authenticated using (true);
create policy "admin baca menu" on public.menus for select to authenticated using (true);
create policy "admin tambah kategori" on public.categories for insert to authenticated with check (true);
create policy "admin ubah kategori" on public.categories for update to authenticated using (true) with check (true);
create policy "admin hapus kategori" on public.categories for delete to authenticated using (true);
create policy "admin tambah menu" on public.menus for insert to authenticated with check (true);
create policy "admin ubah menu" on public.menus for update to authenticated using (true) with check (true);
create policy "admin hapus menu" on public.menus for delete to authenticated using (true);

-- Storage foto (bucket publik, hanya admin yang boleh upload/ubah/hapus)
insert into storage.buckets(id,name,public) values('menu-images','menu-images',true) on conflict do nothing;
create policy "public lihat foto" on storage.objects for select using (bucket_id='menu-images');
create policy "admin upload foto" on storage.objects for insert to authenticated with check (bucket_id='menu-images');
create policy "admin ubah foto" on storage.objects for update to authenticated using (bucket_id='menu-images');
create policy "admin hapus foto" on storage.objects for delete to authenticated using (bucket_id='menu-images');

-- Data awal
insert into public.categories(name,slug,sort_order) values('Nasi Box','nasi-box',1),('Prasmanan & Katering Acara','prasmanan',2);
insert into public.menus(category_id,name,description,price,price_unit,contents)
select id,'Nasi Box Standard','Paket hemat untuk rapat & acara harian.',18000,'Per box',E'Nasi putih\nAyam\nBihun/mi\nCapcay\nKerupuk' from public.categories where slug='nasi-box'
union all select id,'Nasi Box Premium','Lauk lebih lengkap untuk acara istimewa.',25000,'Per box',E'Nasi putih\nRendang\nKentang\nCapcay\nBihun/mi\nKerupuk' from public.categories where slug='nasi-box'
union all select id,'Prasmanan Standard','Hidangan prasmanan lengkap.',35000,'Per orang',E'Nasi putih\nAyam\nKentang\nBihun/mi\nSup ayam/capcay\nKerupuk' from public.categories where slug='prasmanan'
union all select id,'Prasmanan Premium','Menu prasmanan dengan rendang & karedok.',50000,'Per orang',E'Nasi putih\nRendang\nKentang\nBihun/mi\nSup ayam\nKaredok\nKerupuk' from public.categories where slug='prasmanan';
-- Harga di atas hanya contoh; ubah lewat halaman admin.
