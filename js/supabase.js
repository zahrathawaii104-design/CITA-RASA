// ISI dari Supabase > Project Settings > API. HANYA anon (public) key.
// JANGAN PERNAH menaruh service_role key di file frontend.
const SUPABASE_URL = 'https://tizralfcdzyiuukfcfhr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VwodhawUH3g3pygBOS7fmQ_IT4iTAC8';
const WA_NUMBER = '6283819428819'; // format 62..., tanpa + / spasi
const BRAND = 'Cita Rasa Ayah'; // nama usaha
const configured = !SUPABASE_URL.includes('YOUR-PROJECT');
const sb = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
