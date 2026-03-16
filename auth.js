// VARKONIS Auth Library
// Include this on every app page via <script src="auth.js"></script>

const SUPABASE_URL = 'https://neaqsrrgqjdwjdpocuul.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXFzcnJncWpkd2pkcG9jdXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODE1MDIsImV4cCI6MjA4OTE1NzUwMn0.1YcWGKvhC-ywfBTemPN6i8jUMWCVS9zKAOmoJZhLnFc'

let _sb = null
let _session = null
let _profile = null

async function getSupabase() {
  if (_sb) return _sb
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
  _sb = createClient(SUPABASE_URL, SUPABASE_KEY)
  return _sb
}

async function getSession() {
  if (_session) return _session
  const sb = await getSupabase()
  const { data: { session } } = await sb.auth.getSession()
  _session = session
  return session
}

async function getProfile() {
  if (_profile) return _profile
  const session = await getSession()
  if (!session) return null
  const sb = await getSupabase()
  const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).single()
  _profile = data
  return data
}

async function getRole() {
  const profile = await getProfile()
  return profile?.role || 'free'
}

async function requireAuth(redirectTo = 'https://varkonis-auth.vercel.app/login') {
  const session = await getSession()
  if (!session) {
    window.location.href = redirectTo
    return null
  }
  return session
}

async function requirePaid() {
  const session = await requireAuth()
  if (!session) return null
  const role = await getRole()
  if (role === 'free') {
    showUpgradeModal()
    return null
  }
  return session
}

async function requireAdmin() {
  const session = await requireAuth()
  if (!session) return null
  const role = await getRole()
  if (role !== 'admin') {
    window.location.href = 'app-dashboard.html'
    return null
  }
  return session
}

async function signOut() {
  const sb = await getSupabase()
  await sb.auth.signOut()
  window.location.href = 'https://kryphex.github.io/varkonis'
}

function showUpgradeModal() {
  const existing = document.getElementById('upgrade-modal')
  if (existing) { existing.style.display = 'flex'; return }
  const modal = document.createElement('div')
  modal.id = 'upgrade-modal'
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem'
  modal.innerHTML = `
    <div style="background:#0d0d16;border:1px solid rgba(255,255,255,.13);border-radius:10px;padding:2.5rem;max-width:420px;width:100%;text-align:center">
      <div style="width:52px;height:52px;background:rgba(79,110,247,.12);border:1px solid rgba(79,110,247,.25);border-radius:10px;display:grid;place-items:center;margin:0 auto 1.5rem">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b94ff" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <h2 style="font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;margin-bottom:.6rem;color:#fff">Upgrade to unlock this</h2>
      <p style="font-size:.85rem;color:rgba(255,255,255,.52);line-height:1.7;margin-bottom:2rem">This feature is available on the Growth and Scale plans. Upgrade to get full access to AI Insights, Client Reporting, Deal Flow CRM, and Market Terminal.</p>
      <div style="display:flex;gap:.75rem;justify-content:center">
        <a href="pricing.html" style="font-family:'Syne',sans-serif;font-size:.82rem;font-weight:700;padding:.75rem 1.5rem;background:#4f6ef7;color:#fff;border-radius:5px;text-decoration:none">View pricing</a>
        <button onclick="document.getElementById('upgrade-modal').style.display='none'" style="font-family:'Syne',sans-serif;font-size:.82rem;font-weight:600;padding:.75rem 1.5rem;border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.6);border-radius:5px;background:transparent;cursor:pointer">Maybe later</button>
      </div>
    </div>`
  document.body.appendChild(modal)
}

// Update nav based on auth state
async function initNav() {
  try {
    const session = await getSession()
    const role = session ? await getRole() : null

    const navSignin = document.getElementById('nav-signin')
    const navDashboard = document.getElementById('nav-dashboard')
    const mobSignin = document.getElementById('mob-signin')
    const mobDashboard = document.getElementById('mob-dashboard')
    const navAdmin = document.getElementById('nav-admin')

    if (session) {
      if (navSignin) navSignin.style.display = 'none'
      if (navDashboard) navDashboard.style.display = ''
      if (mobSignin) mobSignin.style.display = 'none'
      if (mobDashboard) mobDashboard.style.display = ''
      if (navAdmin && role === 'admin') navAdmin.style.display = ''
    }
  } catch (e) {}
}

window.VAuth = { getSupabase, getSession, getProfile, getRole, requireAuth, requirePaid, requireAdmin, signOut, showUpgradeModal, initNav }