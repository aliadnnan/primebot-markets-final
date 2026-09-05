import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | PrimeBot Markets',
  description: 'Terms and conditions for using PrimeBot Markets trading bots and services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>
        <p className="text-slate-400 mb-8">Last updated: September 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300">
              Welcome to PrimeBot Markets ("Company," "we," "us," or "our"). These Terms & Conditions ("Terms") govern your access to and use of our website, products, and services, including our automated trading Expert Advisors (EAs).
            </p>
            <p className="text-slate-300">
              By accessing or using PrimeBot Markets, you agree to be bound by these Terms. If you do not agree to any part of these Terms, please do not use our services.
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Our Services</h2>
            <p className="text-slate-300">
              PrimeBot Markets provides automated trading Expert Advisors designed to work with MetaTrader 4 (MT4) and MetaTrader 5 (MT5) platforms. Our services include:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>PRIME SCALPER EA</li>
              <li>PRIME HEDGE EA</li>
              <li>PRIME AI ALGORITHM EA</li>
            </ul>
            <p className="text-slate-300">
              These products are sold with lifetime access and are subject to the terms outlined in this agreement.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p className="text-slate-300">
              As a user of our services, you agree to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Use our services only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not engage in any activity that interferes with our services</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Understand that trading involves significant financial risk</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property Rights</h2>
            <p className="text-slate-300">
              All content, software, and materials provided by PrimeBot Markets, including but not limited to our Expert Advisors, website design, and documentation, are the exclusive property of PrimeBot Markets or its content suppliers.
            </p>
            <p className="text-slate-300">
              You are granted a non-exclusive, non-transferable, revocable license to use our products for personal, non-commercial purposes only. You may not reproduce, modify, distribute, or publicly display our products without explicit permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-300">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRIMEBOT MARKETS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OR INABILITY TO USE OUR SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="text-slate-300">
              This includes, but is not limited to, damages resulting from trading losses, system failures, or interruptions in service.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimers</h2>
            <p className="text-slate-300 font-semibold">
              IMPORTANT: Trading involves significant financial risk of loss.
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Past performance does not guarantee future results</li>
              <li>We make no guarantees regarding profits or specific returns</li>
              <li>All trading decisions are your responsibility</li>
              <li>You may lose some or all of your trading capital</li>
              <li>Our EAs are tools - they do not guarantee success</li>
              <li>Market conditions change, and past strategies may not work in future markets</li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Payment Terms</h2>
            <p className="text-slate-300">
              Payments for our services are processed through our designated payment methods. Once payment is verified and approved, you will receive access to your purchased products.
            </p>
            <p className="text-slate-300">
              All prices are in USD and are subject to change without notice. Payment delays or issues may result in delayed access to your products.
            </p>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Refund Policy</h2>
            <p className="text-slate-300">
              Please refer to our separate Refund Policy for detailed information regarding refunds, returns, and your consumer rights.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
            <p className="text-slate-300">
              We reserve the right to terminate or suspend your access to our services at any time, without notice, if we believe you have violated these Terms or engaged in illegal or harmful activity.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to These Terms</h2>
            <p className="text-slate-300">
              We may update these Terms from time to time. Changes will be posted on this page with an updated "Last updated" date. Your continued use of our services constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-300">
              If you have questions about these Terms & Conditions, please contact us at:{' '}
              <a href="mailto:chadnan76@gmail.com" className="text-blue-400 hover:text-blue-300">
                chadnan76@gmail.com
              </a>
            </p>
          </section>

          {/* Agreement */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-12">
            <p className="text-slate-300">
              By using PrimeBot Markets, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
