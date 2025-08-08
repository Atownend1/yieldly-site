import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface CheckoutData {
  email?: string;
  name?: string;
  success_url?: string;
  cancel_url?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.APP_URL || 'https://www.yieldlycf.com';

    // If Stripe is not configured, return null URL
    if (!stripeSecretKey) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          url: null,
          message: 'Stripe not configured - payment processing disabled'
        })
      };
    }

    const checkoutData: CheckoutData = JSON.parse(event.body || '{}');
    
    // Create Stripe checkout session
    const checkoutSession = await createStripeCheckout(
      checkoutData,
      stripeSecretKey,
      appUrl
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        url: checkoutSession.url,
        session_id: checkoutSession.id
      })
    };

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to create checkout session'
      })
    };
  }
};

async function createStripeCheckout(
  data: CheckoutData,
  stripeSecretKey: string,
  appUrl: string
): Promise<any> {
  const stripe = require('stripe')(stripeSecretKey);

  const successUrl = data.success_url || `${appUrl}/success`;
  const cancelUrl = data.cancel_url || `${appUrl}/pricing`;

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: data.email,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Yieldly Legal Finance Platform',
            description: 'AI-powered cashflow automation for legal practices',
            images: [`${appUrl}/images/yieldly-logo.png`]
          },
          unit_amount: 50000, // £500 in pence
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        source: 'yieldly_website',
        plan: 'monthly_subscription'
      }
    },
    metadata: {
      customer_name: data.name || '',
      source: 'website_trial'
    }
  });

  return session;
}

export { handler };