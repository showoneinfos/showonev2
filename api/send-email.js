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

  if (type === 'confirmation_talent') {
    subject = 'Bienvenue sur ShowOne !';
    html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e8e8;">'
      + '<div style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">'
      + '<span style="font-size:22px;font-weight:900;color:#111;">Show<span style="color:#E8383A;">One</span></span>'
      + '</div>'
      + '<div style="padding:36px 32px;">'
      + '<h1 style="font-size:24px;font-weight:900;color:#111;margin:0 0 12px;">Bienvenue ' + (prenom || '') + ' ! 🎉</h1>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 20px;">Ton profil talent est maintenant actif sur ShowOne. Les recruteurs peuvent déjà te découvrir !</p>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 8px;">🎬 <strong>Upload ta vidéo</strong> de présentation</p>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 8px;">📸 <strong>Ajoute ta photo</strong> de profil</p>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 24px;">✍️ <strong>Complète ta bio</strong> pour convaincre les recruteurs</p>'
      + '<a href="https://showonev2.vercel.app/connexion" style="display:inline-block;background:#E8383A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:9px;font-size:14px;font-weight:700;">Accéder à mon espace →</a>'
      + '</div>'
      + '<div style="padding:16px 32px;border-top:1px solid #f0f0f0;font-size:12px;color:#bbb;">© 2025 ShowOne</div>'
      + '</div>';
  }

  else if (type === 'confirmation_recruteur') {
    subject = 'Votre compte recruteur ShowOne est actif !';
    html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e8e8;">'
      + '<div style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">'
      + '<span style="font-size:22px;font-weight:900;color:#111;">Show<span style="color:#E8383A;">One</span></span>'
      + '</div>'
      + '<div style="padding:36px 32px;">'
      + '<h1 style="font-size:24px;font-weight:900;color:#111;margin:0 0 12px;">Compte recruteur activé ! 🎬</h1>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 20px;">Bienvenue ' + (prenom || '') + ' — votre compte recruteur ShowOne est actif.</p>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 8px;">🎬 <strong>Parcourir les vidéos</strong> des talents</p>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 8px;">💬 <strong>Contacter directement</strong> les talents</p>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 24px;">📋 <strong>Déposer des castings</strong></p>'
      + '<a href="https://showonev2.vercel.app/connexion" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:9px;font-size:14px;font-weight:700;">Découvrir les talents →</a>'
      + '</div>'
      + '<div style="padding:16px 32px;border-top:1px solid #f0f0f0;font-size:12px;color:#bbb;">© 2025 ShowOne</div>'
      + '</div>';
  }

  else if (type === 'reset_password') {
    subject = 'Réinitialisation de votre mot de passe ShowOne';
    html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e8e8e8;">'
      + '<div style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">'
      + '<span style="font-size:22px;font-weight:900;color:#111;">Show<span style="color:#E8383A;">One</span></span>'
      + '</div>'
      + '<div style="padding:36px 32px;text-align:center;">'
      + '<h1 style="font-size:24px;font-weight:900;color:#111;margin:0 0 12px;">🔑 Réinitialisation du mot de passe</h1>'
      + '<p style="color:#555;line-height:1.7;margin:0 0 24px;">Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien est valable 1 heure.</p>'
      + '<a href="' + (resetLink || '#') + '" style="display:inline-block;background:#E8383A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:9px;font-size:14px;font-weight:700;">Réinitialiser mon mot de passe →</a>'
      + '</div>'
      + '<div style="padding:16px 32px;border-top:1px solid #f0f0f0;font-size:12px;color:#bbb;">© 2025 ShowOne</div>'
      + '</div>';
  }

  else {
    return res.status(400).json({ error: 'Type inconnu' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: result.message || 'Erreur envoi' });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
