import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | PrimeBot Markets',
  description: 'Privacy policy for PrimeBot Markets. Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: September 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300">
              PrimeBot Markets ("Company," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-slate-300">
              Please read this Privacy Policy carefully. By accessing and using PrimeBot Markets, you acknowledge that you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
            <p className="text-slate-300">
              We collect information you voluntarily provide to us, including:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Account credentials</li>
              <li>Transaction and payment information</li>
              <li>Communication content</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>IP address and browser type</li>
              <li>Pages visited and time spent</li>
              <li>Referral source</li>
              <li>Device information</li>
              <li>Analytics data via Google Analytics</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-300">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Provide and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Analyze usage patterns and improve user experience</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Protection and Security</h2>
            <p className="text-slate-300">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure.
            </p>
            <p className="text-slate-300">
              We use industry-standard encryption and secure protocols to protect sensitive information. Your account is protected by a password that you should keep confidential.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
            <p className="text-slate-300">
              Our website uses the following third-party services:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Supabase for authentication and database management</li>
              <li>Resend for email communications</li>
              <li>Google Analytics for usage analytics</li>
            </ul>
            <p className="text-slate-300">
              These services have their own privacy policies. We recommend reviewing their policies to understand how they handle your data.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking</h2>
            <p className="text-slate-300">
              We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings. Some features may not function properly if cookies are disabled.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Privacy Rights</h2>
            <p className="text-slate-300">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of promotional communications</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="text-slate-300">
              To exercise these rights, please contact us at:{' '}
              <a href="mailto:chadnan76@gmail.com" className="text-blue-400 hover:text-blue-300">
                chadnan76@gmail.com
              </a>
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
            <p className="text-slate-300">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. You can request deletion of your account and associated data at any time.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p className="text-slate-300">
              Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Your continued use of our services constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-300">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:{' '}
              <a href="mailto:chadnan76@gmail.com" className="text-blue-400 hover:text-blue-300">
                chadnan76@gmail.com
              </a>
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-12">
            <p className="text-slate-300">
              By using PrimeBot Markets, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
