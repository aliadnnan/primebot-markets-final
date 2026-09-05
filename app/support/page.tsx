'use client'

import { useState } from 'react'
import RiskDisclaimer from '@/components/RiskDisclaimer'
import { SUPPORT_EMAIL } from '@/lib/constants'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setSubmitted(true)
    setLoading(false)

    // Reset form after 5 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setSubmitted(false)
    }, 5000)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            We're Here to <span className="gradient-text">Help</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Get answers to your questions and support for your trading bots
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: '✉️',
                title: 'Email Support',
                description: 'Send us an email and we will respond within 24 hours',
                content: SUPPORT_EMAIL,
                link: `mailto:${SUPPORT_EMAIL}`,
              },
              {
                icon: '⏰',
                title: 'Response Time',
                description: 'We typically respond to inquiries',
                content: 'Within 24 Hours',
              },
              {
                icon: '🌍',
                title: 'Availability',
                description: 'We support traders in',
                content: 'All Time Zones',
              },
            ].map((method, index) => (
              <div key={index} className="card text-center">
                <div className="text-5xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{method.description}</p>
                <p className="text-blue-400 font-semibold">
                  {method.link ? (
                    <a href={method.link} className="hover:text-blue-300 transition-colors">
                      {method.content}
                    </a>
                  ) : (
                    method.content
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom max-w-2xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Send Us a <span className="gradient-text">Message</span>
          </h2>

          {submitted ? (
            <div className="card text-center py-12 animate-fade-in">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-slate-300 mb-4">Your message has been received</p>
              <p className="text-slate-400">
                We'll get back to you as soon as possible at <span className="text-blue-400">{formData.email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Subject *</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="setup">Setup Help</option>
                  <option value="performance">Performance Question</option>
                  <option value="refund">Refund Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field min-h-32 resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.name || !formData.email || !formData.subject || !formData.message}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="loader"></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Common <span className="gradient-text">Questions</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'How do I install the EA?',
                a: 'After purchase, you\'ll receive detailed installation instructions via email. Simply extract the EA file into your MT4/MT5 experts folder and restart the platform.',
              },
              {
                q: 'What if I have a problem with the EA?',
                a: 'Contact our support team at chadnan76@gmail.com with details about the issue. We\'ll help you troubleshoot or provide a replacement if there\'s a technical problem.',
              },
              {
                q: 'Can I get a refund?',
                a: 'Yes, we offer a 30-day money-back guarantee. Simply contact support within 30 days of purchase with your transaction ID.',
              },
              {
                q: 'What trading platforms are supported?',
                a: 'Our EAs work on MetaTrader 4 (MT4) and MetaTrader 5 (MT5). Most brokers offer these platforms.',
              },
              {
                q: 'Can I modify the EA parameters?',
                a: 'Yes! Each EA allows you to customize parameters like risk, lot size, trading hours, and more without needing to code.',
              },
              {
                q: 'Do I need previous trading experience?',
                a: 'No experience necessary. Our EAs are designed for all skill levels. We provide setup guides and support to get you started.',
              },
              {
                q: 'How often is the EA updated?',
                a: 'We regularly release updates with improvements and new features. All updates are free for license holders.',
              },
              {
                q: 'Can I use the EA on multiple accounts?',
                a: 'Yes, your lifetime license allows unlimited use across multiple trading accounts.',
              },
              {
                q: 'What\'s your support response time?',
                a: 'We aim to respond to all inquiries within 24 hours during business days.',
              },
              {
                q: 'Is the source code included?',
                a: 'No, source code is not included. You receive the compiled EA file ready to use, which protects our proprietary strategies.',
              },
            ].map((item, index) => (
              <details key={index} className="card group cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-white hover:text-blue-400 transition-colors">
                  <span>{item.q}</span>
                  <svg
                    className="w-6 h-6 transform transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </summary>
                <p className="text-slate-400 mt-4 pt-4 border-t border-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Knowledge <span className="gradient-text">Resources</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: '📖',
                title: 'Getting Started Guide',
                description: 'Step-by-step guide to install and configure your EA',
              },
              {
                icon: '⚙️',
                title: 'Configuration Guide',
                description: 'Learn how to customize EA parameters for your trading style',
              },
              {
                icon: '🔧',
                title: 'Troubleshooting',
                description: 'Common issues and solutions',
              },
              {
                icon: '📊',
                title: 'Performance Tracking',
                description: 'How to monitor your EA trading results',
              },
              {
                icon: '🛡️',
                title: 'Risk Management',
                description: 'Best practices for protecting your trading capital',
              },
              {
                icon: '🎓',
                title: 'Video Tutorials',
                description: 'Visual guides for setup and configuration',
              },
            ].map((resource, index) => (
              <div key={index} className="card hover:border-blue-500 transition-colors cursor-pointer">
                <div className="text-3xl mb-3">{resource.icon}</div>
                <h3 className="text-white font-bold mb-2">{resource.title}</h3>
                <p className="text-slate-400 text-sm">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Email CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-2xl">
          <div className="glass border-2 border-blue-500/50 rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Need Immediate Help?</h2>
            <p className="text-lg text-slate-300 mb-6">
              Reach out directly to our support team
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="btn-primary inline-block"
            >
              Email: {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="section-padding bg-slate-800/50">
        <div className="container-custom">
          <RiskDisclaimer />
        </div>
      </section>
    </div>
  )
}
