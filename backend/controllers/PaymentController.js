import Stripe from 'stripe';
import { stripe } from '../config/stripe.js';
import HarvestEquipment from '../models/HarvestEquipment.js';
import StorageFacility from '../models/StorageFacility.js';
import Transport from '../models/Transport.js';

// Create payment intent for equipment rental
const createEquipmentPaymentIntent = async (req, res) => {
  try {
    const { equipmentId, days, amount } = req.body;
    
    const equipment = await HarvestEquipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'pkr',
      metadata: {
        equipmentId,
        days,
        farmerId: req.user.id
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment intent', details: err.message });
  }
};

// Create payment intent for storage reservation
const createStoragePaymentIntent = async (req, res) => {
  try {
    const { facilityId, months, amount } = req.body;
    
    const facility = await StorageFacility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: 'Storage facility not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'pkr',
      metadata: {
        facilityId,
        months,
        farmerId: req.user.id
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment intent', details: err.message });
  }
};

// Create payment intent for transport
const createTransportPaymentIntent = async (req, res) => {
  try {
    const { transportId, distance, amount } = req.body;
    
    const transport = await Transport.findById(transportId);
    if (!transport) {
      return res.status(404).json({ error: 'Transport option not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'pkr',
      metadata: {
        transportId,
        distance,
        farmerId: req.user.id
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment intent', details: err.message });
  }
};

// Handle successful payment webhook
const handlePaymentWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Handle successful payment based on metadata
    console.log('Payment succeeded:', paymentIntent);
  }

  res.json({ received: true });
};

export {
  createEquipmentPaymentIntent,
  createStoragePaymentIntent,
  createTransportPaymentIntent,
  handlePaymentWebhook
};