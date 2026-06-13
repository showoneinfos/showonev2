// api/webhook.js
// Reçoit les événements Stripe et met à jour Supabase

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://emiuzigtlomlrsofxqyf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function supabasePatch(table, filter, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  return res;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // En mode test, on peut skipper la vérification de signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!userId || !plan) break;

        // Déterminer le type de compte et la table à mettre à jour
        if (plan === 'talent_pro') {
          // Mettre à jour utilisateurs
          await supabasePatch('utilisateurs', `id=eq.${userId}`, {
            plan: 'pro',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId
          });
        } else if (plan === 'recruteur_pro') {
          await supabasePatch('utilisateurs', `id=eq.${userId}`, {
            plan: 'pro',
            type_compte: 'recruteur',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId
          });
        }
        console.log(`Paiement confirmé — userId: ${userId}, plan: ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Abonnement annulé — repasser en gratuit
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await supabasePatch('utilisateurs', `stripe_customer_id=eq.${customerId}`, {
          plan: 'gratuit',
          stripe_subscription_id: null
        });
        console.log(`Abonnement annulé — customerId: ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        // Paiement échoué
        const invoice = event.data.object;
        console.log(`Paiement échoué — customer: ${invoice.customer}`);
        break;
      }
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};
