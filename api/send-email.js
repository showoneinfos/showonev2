// api/send-email.js — À placer dans le dossier /api sur GitHub
// Gère l'envoi d'emails via Resend pour ShowOne

const RESEND_API_KEY = 're_atcWAbVo_AWCJDJfQUDEVqcsr8NcZ4Zqk';
const FROM_EMAIL = 'ShowOne <noreply@showone.fr>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { type, to, prenom, resetLink } = req.body;

  if (!type || !to) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  let subject = '';
  let html = '';

  // ============================================================
  // EMAIL 1 — CONFIRMATION INSCRIPTION TALENT
  // ============================================================
  if (type === 'confirmation_talent') {
        subject = '🎉 Bienvenue sur ShowOne !';
    html = `<!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
        <div style="padding:24px 32px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;">
          <span style="font-size:22px;font-weight:900;color:#111;letter-spacing:-0.5px;">Show<span style="color:#E8383A;">One</span></span>
        </div>
        <div style="padding:36px 32px;">
          <h1 style="font-size:26px;font-weight:900;color:#111;letter-spacing:-0.8px;margin:0 0 12px;">Bienvenue \${prenom || ''} ! 🎉</h1>
          <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">Ton profil talent est maintenant actif sur ShowOne. Les recruteurs peuvent déjà te découvrir !</p>
          <div style="background:#f8f8f8;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:700;color:#111;margin:0 0 12px;">📋 Prochaines étapes :</p>
            <p style="font-size:14px;color:#555;margin:0 0 8px;line-height:1.6;">🎬 <strong>Upload ta vidéo</strong> de présentation</p>
            <p style="font-size:14px;color:#555;margin:0 0 8px;line-height:1.6;">📸 <strong>Ajoute ta photo</strong> de profil</p>
            <p style="font-size:14px;color:#555;margin:0;line-height:1.6;">✍️ <strong>Complète ta bio</strong> pour convaincre les recruteurs</p>
          </div>
          <a href="https://showonev2.vercel.app/dashboard-talent" style="display:inline-block;background:#E8383A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:9px;font-size:14px;font-weight:700;">Accéder à mon espace →</a>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #f0f0f0;font-size:12px;color:#bbb;">
          © 2025 ShowOne · <a href="https://showonev2.vercel.app/contact" style="color:#bbb;">Contact</a> · <a href="https://showonev2.vercel.app/legal" style="color:#bbb;">CGU</a>
        </div>
      </div>
    </body>
    </html>\`;
  }

  // ============================================================
  // EMAIL 2 — CONFIRMATION INSCRIPTION RECRUTEUR
  // ============================================================
  else if (type === 'confirmation_recruteur') {
        subject = '🎬 Votre compte recruteur ShowOne est actif !';
    html = `<!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
        <div style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:22px;font-weight:900;color:#111;letter-spacing:-0.5px;">Show<span style="color:#E8383A;">One</span></span>
        </div>
        <div style="padding:36px 32px;">
          <h1 style="font-size:26px;font-weight:900;color:#111;letter-spacing:-0.8px;margin:0 0 12px;">Compte recruteur activé ! 🎬</h1>
          <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">Bienvenue \${prenom || ''} — votre compte recruteur ShowOne est actif. Accédez dès maintenant à tous les talents.</p>
          <div style="background:#f8f8f8;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;font-weight:700;color:#111;margin:0 0 12px;">✨ Ce que vous pouvez faire :</p>
            <p style="font-size:14px;color:#555;margin:0 0 8px;line-height:1.6;">🎬 <strong>Parcourir les vidéos</strong> des talents par catégorie</p>
            <p style="font-size:14px;color:#555;margin:0 0 8px;line-height:1.6;">💬 <strong>Contacter directement</strong> les talents</p>
            <p style="font-size:14px;color:#555;margin:0;line-height:1.6;">📋 <strong>Déposer des castings</strong> et recevoir des candidatures</p>
          </div>
          <a href="https://showonev2.vercel.app/dashboard-recruteur" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:9px;font-size:14px;font-weight:700;">Découvrir les talents →</a>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #f0f0f0;font-size:12px;color:#bbb;">
          © 2025 ShowOne · <a href="https://showonev2.vercel.app/contact" style="color:#bbb;">Contact</a> · <a href="https://showonev2.vercel.app/legal" style="color:#bbb;">CGU</a>
        </div>
      </div>
    </body>
    </html>\`;
  }

  // ============================================================
  // EMAIL 3 — MOT DE PASSE OUBLIÉ
  // ============================================================
  else if (type === 'reset_password') {
    subject = '🔑 Réinitialisation de votre mot de passe ShowOne';
    html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f3ff;font-family:'DM Sans',Arial,sans-serif;">
      <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(91,79,232,0.1);">

        <div style="background:#1a1535;padding:36px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;">Show<span style="color:#E8394F;">One</span></div>
          <div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:4px;">La plateforme des talents</div>
        </div>

        <div style="padding:40px;text-align:center;">
          <div style="width:72px;height:72px;background:rgba(91,79,232,0.1);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:20px;">🔑</div>
          <h1 style="color:#1a1535;font-size:24px;font-weight:800;margin:0 0 12px;">Réinitialisation du mot de passe</h1>
          <p style="color:#a09dc0;font-size:15px;line-height:1.65;margin:0 0 32px;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous — ce lien est valable <strong>1 heure</strong>.</p>

          <a href="${resetLink}" style="display:inline-block;background:#E8394F;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;margin-bottom:32px;">Réinitialiser mon mot de passe →</a>

          <div style="background:#fff8f8;border:1.5px solid rgba(232,57,79,0.2);border-radius:12px;padding:16px;margin-bottom:28px;text-align:left;">
            <p style="color:#E8394F;font-size:13px;font-weight:700;margin:0 0 6px;">⚠️ Si vous n'avez pas fait cette demande</p>
            <p style="color:#a09dc0;font-size:13px;margin:0;line-height:1.6;">Ignorez cet email — votre mot de passe ne sera pas modifié. Votre compte est en sécurité.</p>
          </div>

          <p style="color:#a09dc0;font-size:13px;line-height:1.6;margin:0;">Des questions ? <a href="mailto:showone.infos@gmail.com" style="color:#5B4FE8;">showone.infos@gmail.com</a></p>
        </div>

        <div style="background:#f5f3ff;padding:24px 40px;text-align:center;border-top:1px solid rgba(91,79,232,0.1);">
          <p style="color:#a09dc0;font-size:12px;margin:0;">© 2025 ShowOne — Curintina Suprana, 20167 Cuttoli Corticchiato</p>
        </div>

      </div>
    </body>
    </html>`;
  }

  else {
    return res.status(400).json({ error: 'Type d\'email inconnu' });
  }

  // Envoi via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: result.message || 'Erreur envoi email' });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
