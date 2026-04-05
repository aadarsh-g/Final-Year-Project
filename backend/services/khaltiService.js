const axios = require('axios');

const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:5173';

class KhaltiService {
  /**
   * Initiate a Khalti payment
   * @param {Object} params
   * @param {string} params.purchaseOrderId - Unique order/reference ID
   * @param {string} params.purchaseOrderName - Description of the order
   * @param {number} params.amountNPR - Amount in Nepali Rupees (will be converted to paisa)
   * @param {Object} params.customerInfo - { name, email, phone }
   * @param {string} params.returnPath - Frontend path to redirect after payment (e.g. '/khalti/verify')
   * @param {Array}  params.productDetails - Optional product details array
   */
  async initiatePayment({ purchaseOrderId, purchaseOrderName, amountNPR, customerInfo, returnPath = '/khalti/verify', productDetails = [] }) {
    const amountPaisa = Math.round(amountNPR * 100);

    if (amountPaisa < 1000) {
      throw new Error('Minimum Khalti payment amount is Rs. 10 (1000 paisa)');
    }

    const payload = {
      return_url: `${FRONTEND_URL}${returnPath}`,
      website_url: WEBSITE_URL,
      amount: amountPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
    };

    if (productDetails.length > 0) {
      payload.product_details = productDetails;
    }

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  /**
   * Verify / Lookup a Khalti payment by pidx
   * @param {string} pidx - Payment identifier from Khalti
   * @returns {Object} Khalti lookup response { pidx, total_amount, status, transaction_id, fee, refunded }
   */
  async lookupPayment(pidx) {
    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  /**
   * Check whether a Khalti lookup status counts as a successful payment
   */
  isPaymentSuccessful(status) {
    return status === 'Completed';
  }
}

module.exports = new KhaltiService();
