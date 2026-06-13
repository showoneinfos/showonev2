// api/create-checkout.js — Sans dépendance npm, utilise fetch natif

const PRICE_IDS = {
  talent_pro: 'price_1TWtKMDf46TAJOdGM44YH0kZ',
  recruteur_pro: 'price_1TWtLeDf46TAJOdG5KQmg3iM'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { plan, userId, userEmail, successUrl, cancelUrl } = req.body;

    const priceId = PRICE_IDS[plan];
    if (!priceId) return res.status(400).json({ error: 'Plan invalide' });

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ error: 'Clé Stripe manquante' });

    // Appel API Stripe via fetch natif (pas besoin du package stripe)
    const params = new URLSearchParams({
      'mode': 'subscription',
      'payment_method_types[]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': successUrl || 'https://www.showone.fr/paiement-succes?type=' + (plan === 'talent_pro' ? 'talent' : 'recruteur'),
      'cancel_url': cancelUrl || 'https://www.showone.fr/dashboard-talent',
      'locale': 'fr',
      'metadata[userId]': userId || '',
      'metadata[plan]': plan || ''
    });

    if (userEmail) params.append('customer_email', userEmail);

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error('Stripe error:', session);
      return res.status(400).json({ error: session.error?.message || 'Erreur Stripe' });
    }

    return res.status(200).json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
};
