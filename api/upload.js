export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const MUX_ID = '004310b6-3d93-4799-9d08-f966924bc618';
const MUX_SECRET = '+2mbKI+H8WlNRgXYtVKn06g4vAlXieQyAiXJ9+VupygFo3lwg0uavkUiCF6DWbssp1vItBEdjNJ';
const SUPABASE_URL = 'https://emiuzigtlomlrsofxqyf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_U8P52zBkzF6Nqno_mmbcVQ_bKQLNmTP';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-supabase-token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const credentials = Buffer.from(MUX_ID + ':' + MUX_SECRET).toString('base64');
  const muxAuth = 'Basic ' + credentials;

  // ── HELPER : créer une URL upload Mux ──────────────────────
  async function creerUploadMux() {
    const muxRes = await fetch('https://api.mux.com/video/v1/uploads', {
      method: 'POST',
      headers: { 'Authorization': muxAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cors_origin: '*',
        new_asset_settings: { playback_policy: ['public'], max_resolution_tier: '1080p' },
        timeout: 3600
      })
    });
    const muxData = await muxRes.json();
    if (!muxRes.ok) throw new Error('Erreur Mux: ' + JSON.stringify(muxData));
    return { upload_url: muxData.data.url, upload_id: muxData.data.id };
  }

  // ── URL UPLOAD POUR RECRUTEUR (sans vérification quota) ────
  // Utilisé pour les vidéos d'annonce casting
  if (req.method === 'GET' && req.query.action === 'upload-url-recruteur') {
    try {
      const authToken = req.headers['authorization']?.replace('Bearer ', '');
      if (!authToken) return res.status(401).json({ error: 'Non authentifié' });

      // Vérifier que c'est bien un recruteur
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${authToken}` }
      });
      const userData = await userRes.json();
      const userId = userData?.id;
      if (!userId) return res.status(401).json({ error: 'Session expirée' });

      // Pas de vérification quota pour les recruteurs
      const result = await creerUploadMux();
      return res.status(200).json(result);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── URL UPLOAD POUR TALENT (avec vérification quota) ───────
  if (req.method === 'GET' && req.query.action === 'upload-url') {
    try {
      // 1. Token Supabase
      const authToken = req.headers['authorization']?.replace('Bearer ', '');
      if (!authToken) return res.status(401).json({ error: 'Non authentifié' });

      // 2. Utilisateur connecté
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${authToken}` }
      });
      const userData = await userRes.json();
      const userId = userData?.id;
      if (!userId) return res.status(401).json({ error: 'Session expirée' });

      // 3. Plan de l'utilisateur
      const planRes = await fetch(`${SUPABASE_URL}/rest/v1/utilisateurs?id=eq.${userId}&select=plan,type_compte`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${authToken}` }
      });
      const planData = await planRes.json();
      const plan = planData?.[0]?.plan || 'gratuit';
      const typeCompte = planData?.[0]?.type_compte || 'talent';

      // Si c'est un recruteur — pas de quota
      if (typeCompte === 'recruteur') {
        const result = await creerUploadMux();
        return res.status(200).json(result);
      }

      // 4. Nombre de vidéos du talent (via profil_talent)
      const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profils_talents?utilisateur_id=eq.${userId}&select=id`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${authToken}` }
      });
      const profData = await profRes.json();
      const talentId = profData?.[0]?.id;

      let nbVideos = 0;
      if (talentId) {
        const vidRes = await fetch(`${SUPABASE_URL}/rest/v1/videos?talent_id=eq.${talentId}&select=id`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${authToken}` }
        });
        const vidData = await vidRes.json();
        nbVideos = Array.isArray(vidData) ? vidData.length : 0;
      }

      // 5. Vérifier la limite
      const MAX = plan === 'pro' ? 10 : 1;
      if (nbVideos >= MAX) {
        return res.status(403).json({
          error: 'LIMITE_ATTEINTE',
          plan, nbVideos, max: MAX,
          message: plan === 'gratuit'
            ? 'Plan Gratuit limité à 1 vidéo. Passez au plan Pro pour uploader jusqu\'à 10 vidéos.'
            : 'Limite de 10 vidéos atteinte sur le plan Pro.'
        });
      }

      // 6. Créer URL upload Mux
      const result = await creerUploadMux();
      return res.status(200).json(result);

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── VÉRIFIER STATUT UPLOAD ──────────────────────────────────
  if (req.method === 'GET' && req.query.action === 'get-playback') {
    try {
      const { upload_id } = req.query;
      const uploadRes = await fetch('https://api.mux.com/video/v1/uploads/' + upload_id, { headers: { 'Authorization': muxAuth } });
      const uploadData = await uploadRes.json();
      const asset_id = uploadData.data?.asset_id;
      if (!asset_id) return res.status(200).json({ status: 'waiting', playback_id: null });
      const assetRes = await fetch('https://api.mux.com/video/v1/assets/' + asset_id, { headers: { 'Authorization': muxAuth } });
      const assetData = await assetRes.json();
      return res.status(200).json({ status: assetData.data?.status, playback_id: assetData.data?.playback_ids?.[0]?.id, asset_id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── SUPPRIMER UNE VIDÉO ─────────────────────────────────────
  if (req.method === 'DELETE' && req.query.action === 'delete-video') {
    try {
      const { asset_id, video_id } = req.query;
      const supabase_token = req.headers['x-supabase-token'];
      if (asset_id) {
        await fetch(`https://api.mux.com/video/v1/assets/${asset_id}`, { method: 'DELETE', headers: { 'Authorization': muxAuth } });
      }
      if (video_id && supabase_token) {
        await fetch(`${SUPABASE_URL}/rest/v1/videos?id=eq.${video_id}`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${supabase_token}`, 'Prefer': 'return=minimal' }
        });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(404).json({ error: 'Route not found' });
}
