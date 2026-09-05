import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy | PrimeBot Markets',
  description: 'Refund and return policy for PrimeBot Markets trading bots. Learn about your consumer rights.',
}

export default function RefundPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: September 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Refund Eligibility</h2>
            <p className="text-slate-300">
              At PrimeBot Markets, we stand behind the quality of our products. If you are not completely satisfied with your purchase, we offer refunds under the following conditions:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Refund requests must be made within 30 days of purchase</li>
              <li>You must provide a valid reason for the refund request</li>
              <li>The product must not have been used for actual trading</li>
              <li>You must provide your order ID and transaction details</li>
            </ul>
          </section>

          {/* What Qualifies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. What Qualifies for Refund</h2>
            <p className="text-slate-300">
              The following reasons may qualify for a refund:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Product does not work as described on our website</li>
              <li>Product is incompatible with your MetaTrader platform version</li>
              <li>Product is incompatible with your broker or trading account</li>
              <li>Technical issues prevent product installation or use</li>
              <li>Payment processing errors or duplicate charges</li>
            </ul>
          </section>

          {/* What Does Not Qualify */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. What Does Not Qualify for Refund</h2>
            <p className="text-slate-300">
              The following situations do not qualify for refunds:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Changes in mind after successful testing</li>
              <li>Trading losses incurred while using the product</li>
              <li>Expectations of guaranteed profits or returns</li>
              <li>Requests made more than 30 days after purchase</li>
              <li>Product has been actively used for trading</li>
              <li>Market conditions not being favorable for the trading strategy</li>
              <li>User error or misunderstanding of product documentation</li>
            </ul>
          </section>

          {/* How to Request a Refund */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. How to Request a Refund</h2>
            <p className="text-slate-300">
              To request a refund, follow these steps:
            </p>
            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-4">
              <li>Log into your PrimeBot Markets account</li>
              <li>Navigate to your orders in your dashboard</li>
              <li>Select the order you wish to request a refund for</li>
              <li>Click "Request Refund" and provide your reason</li>
              <li>Submit any supporting documentation (optional but recommended)</li>
              <li>Our team will review your request within 5 business days</li>
            </ol>
            <p className="text-slate-300 mt-4">
              Alternatively, you can email your refund request to:{' '}
              <a href="mailto:chadnan76@gmail.com" className="text-blue-400 hover:text-blue-300">
                chadnan76@gmail.com
              </a>
              {' '}with your order ID and reason for refund.
            </p>
          </section>

          {/* Refund Processing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Refund Processing Timeline</h2>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Initial review: 5 business days</li>
              <li>Approval decision: within 10 business days of submission</li>
              <li>Processing refund: 5-10 business days after approval</li>
              <li>Total timeline: typically 15-30 days from submission</li>
            </ul>
            <p className="text-slate-300 mt-4">
              Refund processing time depends on your payment method and financial institution.
            </p>
          </section>

          {/* Payment Methods */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Refund Payment Methods</h2>
            <p className="text-slate-300">
              Refunds will be processed back to the original payment method used for purchase:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>JazzCash: Refund to original account</li>
              <li>Easypaisa: Refund to original account</li>
              <li>Binance Pay: Refund to Binance wallet</li>
              <li>Bybit Pay: Refund to Bybit account</li>
            </ul>
            <p className="text-slate-300">
              Please allow additional time for the refund to appear in your account, as this depends on your payment provider and bank.
            </p>
          </section>

          {/* Transaction Fees */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Transaction Fees</h2>
            <p className="text-slate-300">
              In some cases, your payment provider or bank may deduct transaction fees from the refund amount. PrimeBot Markets is not responsible for these fees. We recommend checking with your financial institution regarding their refund policies.
            </p>
          </section>

          {/* Partial Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Partial Refunds</h2>
            <p className="text-slate-300">
              In cases where a product has been partially used or tested, we reserve the right to issue a partial refund at our discretion. The refund amount will reflect the actual value provided and the costs incurred in processing your request.
            </p>
          </section>

          {/* Exceptions */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Special Circumstances</h2>
            <p className="text-slate-300">
              In cases of technical issues, broker incompatibility, or platform problems beyond your control, we may offer:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>A full refund</li>
              <li>A replacement product</li>
              <li>A credit toward another product</li>
              <li>Extended support period to resolve the issue</li>
            </ul>
            <p className="text-slate-300">
              We will work with you to find the best solution for your situation.
            </p>
          </section>

          {/* Warranty */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. No Performance Warranty</h2>
            <p className="text-slate-300 font-semibold">
              IMPORTANT DISCLAIMER:
            </p>
            <p className="text-slate-300">
              Our products are provided on an "AS-IS" basis. We do not guarantee any specific level of profit, performance, or return on investment. Past performance does not guarantee future results.
            </p>
            <p className="text-slate-300">
              Trading always involves risk, including the potential loss of your entire investment. Users are solely responsible for their trading decisions and outcomes. A refund does not constitute an admission of product failure or guarantee that similar results will not occur with future use.
            </p>
          </section>

          {/* Appeals */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Refund Appeals</h2>
            <p className="text-slate-300">
              If your refund request is denied, you have the right to appeal our decision. Submit an appeal with additional information or evidence to:{' '}
              <a href="mailto:chadnan76@gmail.com" className="text-blue-400 hover:text-blue-300">
                chadnan76@gmail.com
              </a>
            </p>
            <p className="text-slate-300">
              Appeals will be reviewed by our management team within 10 business days.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Refund Policy</h2>
            <p className="text-slate-300">
              We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated "Last updated" date. Refund requests submitted before policy changes will be processed under the previous policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Support</h2>
            <p className="text-slate-300">
              For questions about this Refund Policy or to initiate a refund request, contact us at:{' '}
              <a href="mailto:chadnan76@gmail.com" className="text-blue-400 hover:text-blue-300">
                chadnan76@gmail.com
              </a>
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-12">
            <p className="text-slate-300">
              By purchasing from PrimeBot Markets, you acknowledge that you have read and understood this Refund Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
