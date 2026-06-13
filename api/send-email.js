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
    html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f3ff;font-family:'DM Sans',Arial,sans-serif;">
      <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(91,79,232,0.1);">
        
        <!-- HEADER -->
        <div style="background:#1a1535;padding:36px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Show<span style="color:#E8394F;">One</span></div>
          <div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:4px;">La plateforme des talents</div>
        </div>

        <!-- HERO -->
        <div style="background:linear-gradient(135deg,#5B4FE8,#3D32C4);padding:40px;text-align:center;">
          <div style="font-size:52px;margin-bottom:12px;">🎉</div>
          <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 10px;">Bienvenue ${prenom || 'sur ShowOne'} !</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;line-height:1.6;">Ton profil talent est maintenant actif.<br>Les recruteurs peuvent déjà te découvrir !</p>
        </div>

        <!-- CONTENU -->
        <div style="padding:40px;">
          <p style="color:#3d3760;font-size:15px;line-height:1.7;margin:0 0 24px;">Bonjour <strong>${prenom || ''}</strong>,</p>
          <p style="color:#3d3760;font-size:15px;line-height:1.7;margin:0 0 24px;">Ton inscription sur ShowOne est confirmée ! Tu fais maintenant partie de la communauté de talents la plus dynamique de France. 🚀</p>
          
          <!-- ÉTAPES -->
          <div style="background:#f5f3ff;border-radius:14px;padding:24px;margin-bottom:28px;">
            <p style="color:#1a1535;font-size:14px;font-weight:700;margin:0 0 16px;">📋 Prochaines étapes pour être visible :</p>
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
              <div style="background:#5B4FE8;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;line-height:24px;text-align:center;">1</div>
              <p style="color:#3d3760;font-size:14px;margin:0;line-height:1.6;padding-top:2px;">📸 <strong>Ajoute ta photo de profil</strong> pour être reconnaissable</p>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
              <div style="background:#5B4FE8;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;line-height:24px;text-align:center;">2</div>
              <p style="color:#3d3760;font-size:14px;margin:0;line-height:1.6;padding-top:2px;">🎬 <strong>Upload ta première vidéo</strong> pour montrer ton talent</p>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <div style="background:#5B4FE8;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;line-height:24px;text-align:center;">3</div>
              <p style="color:#3d3760;font-size:14px;margin:0;line-height:1.6;padding-top:2px;">✍️ <strong>Complète ta bio</strong> pour convaincre les recruteurs</p>
            </div>
          </div>

          <!-- BOUTON -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="https://www.showone.fr/dashboard-talent" style="display:inline-block;background:#E8394F;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;">🚀 Accéder à mon espace →</a>
          </div>

          <p style="color:#a09dc0;font-size:13px;line-height:1.6;margin:0;">Des questions ? Contacte-nous à <a href="mailto:showone.infos@gmail.com" style="color:#5B4FE8;">showone.infos@gmail.com</a></p>
        </div>

        <!-- FOOTER -->
        <div style="background:#f5f3ff;padding:24px 40px;text-align:center;border-top:1px solid rgba(91,79,232,0.1);">
          <p style="color:#a09dc0;font-size:12px;margin:0;">© 2025 ShowOne — Curintina Suprana, 20167 Cuttoli Corticchiato</p>
          <p style="color:#a09dc0;font-size:12px;margin:6px 0 0;"><a href="https://www.showone.fr/legal" style="color:#5B4FE8;text-decoration:none;">CGU</a> · <a href="https://www.showone.fr/contact" style="color:#5B4FE8;text-decoration:none;">Contact</a></p>
        </div>

      </div>
    </body>
    </html>`;
  }

  // ============================================================
  // EMAIL 2 — CONFIRMATION INSCRIPTION RECRUTEUR
  // ============================================================
  else if (type === 'confirmation_recruteur') {
    subject = '🔍 Votre compte recruteur ShowOne est actif !';
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

        <div style="background:linear-gradient(135deg,#1a1535,#2d2560);padding:40px;text-align:center;">
          <div style="font-size:52px;margin-bottom:12px;">🔍</div>
          <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 10px;">Compte recruteur activé !</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;line-height:1.6;">Bienvenue ${prenom || ''} — accédez dès maintenant<br>à tous les talents disponibles sur ShowOne.</p>
        </div>

        <div style="padding:40px;">
          <p style="color:#3d3760;font-size:15px;line-height:1.7;margin:0 0 24px;">Bonjour <strong>${prenom || ''}</strong>,</p>
          <p style="color:#3d3760;font-size:15px;line-height:1.7;margin:0 0 24px;">Votre compte recruteur est maintenant actif. Vous pouvez parcourir les profils de nos talents, envoyer des messages et gérer vos castings.</p>

          <div style="background:#f5f3ff;border-radius:14px;padding:24px;margin-bottom:28px;">
            <p style="color:#1a1535;font-size:14px;font-weight:700;margin:0 0 16px;">✨ Ce que vous pouvez faire :</p>
            <p style="color:#3d3760;font-size:14px;margin:0 0 10px;line-height:1.6;">🎬 <strong>Parcourir les vidéos</strong> des talents par catégorie</p>
            <p style="color:#3d3760;font-size:14px;margin:0 0 10px;line-height:1.6;">💬 <strong>Contacter directement</strong> les talents qui vous intéressent</p>
            <p style="color:#3d3760;font-size:14px;margin:0;line-height:1.6;">📋 <strong>Déposer des castings</strong> et recevoir des candidatures</p>
          </div>

          <div style="text-align:center;margin-bottom:28px;">
            <a href="https://www.showone.fr/dashboard-recruteur" style="display:inline-block;background:#5B4FE8;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:15px;font-weight:700;">🔍 Découvrir les talents →</a>
          </div>

          <p style="color:#a09dc0;font-size:13px;line-height:1.6;margin:0;">Des questions ? <a href="mailto:showone.infos@gmail.com" style="color:#5B4FE8;">showone.infos@gmail.com</a></p>
        </div>

        <div style="background:#f5f3ff;padding:24px 40px;text-align:center;border-top:1px solid rgba(91,79,232,0.1);">
          <p style="color:#a09dc0;font-size:12px;margin:0;">© 2025 ShowOne — Curintina Suprana, 20167 Cuttoli Corticchiato</p>
          <p style="color:#a09dc0;font-size:12px;margin:6px 0 0;"><a href="https://www.showone.fr/legal" style="color:#5B4FE8;text-decoration:none;">CGU</a> · <a href="https://www.showone.fr/contact" style="color:#5B4FE8;text-decoration:none;">Contact</a></p>
        </div>

      </div>
    </body>
    </html>`;
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
