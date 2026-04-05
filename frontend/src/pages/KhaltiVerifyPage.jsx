import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

/**
 * KhaltiVerifyPage
 * Khalti redirects the user here after payment.
 * Query params: pidx, txnId, amount, total_amount, status,
 *               mobile, purchase_order_id, purchase_order_name, transaction_id
 */
const KhaltiVerifyPage = ({ paymentType = 'checkout' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState(null); // { success, message, orderNumber, orderId, status }

  const pidx = searchParams.get('pidx');
  const status = searchParams.get('status');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!pidx) {
      setResult({ success: false, message: 'Invalid payment callback — no pidx found.' });
      setVerifying(false);
      return;
    }

    // If Khalti already says cancelled/failed, skip the lookup call
    if (status === 'User canceled') {
      setResult({ success: false, message: 'Payment was cancelled.', status: 'User canceled' });
      setVerifying(false);
      return;
    }

    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const endpoint =
        paymentType === 'fine'
          ? 'http://localhost:5001/api/khalti/verify-fine'
          : 'http://localhost:5001/api/khalti/verify-checkout';

      const response = await axios.post(
        endpoint,
        { pidx },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);

      if (response.data.success) {
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      const errData = error.response?.data;
      setResult({
        success: false,
        message: errData?.message || 'Payment verification failed.',
        status: 'Error',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleGoToOrders = () => navigate('/orders');
  const handleGoToFines = () => navigate('/fines');
  const handleGoToCheckout = () => navigate('/checkout');
  const handleGoToCart = () => navigate('/cart');

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
          <p className="text-gray-500">Please wait while we confirm your payment with Khalti…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {result?.success ? (
          <>
            {/* Success */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-2">{result.message}</p>

            {result.orderNumber && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-800 font-medium">
                  Order: <span className="font-bold">{result.orderNumber}</span>
                </p>
                {result.transactionId && (
                  <p className="text-xs text-green-600 mt-1">
                    Khalti Txn: {result.transactionId}
                  </p>
                )}
              </div>
            )}

            {result.rentalNumber && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-800 font-medium">
                  Fine paid for rental: <span className="font-bold">{result.rentalNumber}</span>
                </p>
                {result.fineAmount && (
                  <p className="text-xs text-green-600 mt-1">Amount: Rs. {result.fineAmount}</p>
                )}
                {result.transactionId && (
                  <p className="text-xs text-green-600 mt-1">Khalti Txn: {result.transactionId}</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              {paymentType === 'fine' ? (
                <button
                  onClick={handleGoToFines}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  View My Fines
                </button>
              ) : (
                <button
                  onClick={handleGoToOrders}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  View My Orders
                </button>
              )}
              <Link
                to="/catalog"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Failure / Cancelled */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {result?.status === 'User canceled' ? (
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {result?.status === 'User canceled' ? 'Payment Cancelled' : 'Payment Failed'}
            </h2>
            <p className="text-gray-500 mb-6">{result?.message || 'Something went wrong with your payment.'}</p>

            {result?.orderNumber && (
              <p className="text-sm text-gray-500 mb-4">
                Order <span className="font-semibold">{result.orderNumber}</span> is pending payment.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {paymentType === 'fine' ? (
                <button
                  onClick={handleGoToFines}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Back to Fines
                </button>
              ) : (
                <button
                  onClick={handleGoToCart}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Back to Cart
                </button>
              )}
              <Link
                to="/catalog"
                className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KhaltiVerifyPage;
