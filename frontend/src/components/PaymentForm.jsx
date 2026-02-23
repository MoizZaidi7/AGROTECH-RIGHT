import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentForm = ({ amount, onSuccess, onCancel, clientSecret }) => {  // Added clientSecret prop
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Farmer Name',
          },
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setProcessing(false);
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {succeeded ? (
        <div className="text-center">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
          <p className="text-gray-600">Your payment of PKR {amount} has been processed.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Details</h3>
          <div className="mb-4">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          
          {error && (
            <div className="text-red-500 mb-4 flex items-center">
              <FaTimesCircle className="mr-2" />
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || !stripe}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              {processing ? 'Processing...' : (
                <>
                  <FaCreditCard className="mr-2" />
                  Pay PKR {amount}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;