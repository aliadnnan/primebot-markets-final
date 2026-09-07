'use client'

import { useState } from 'react'
import { getWhatsAppLink } from '@/lib/constants'

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false)

  // Built from CONTACT_INFO so the number is in the international format that
  // wa.me actually accepts (92... rather than the local 03... form).
  const whatsappURL = getWhatsAppLink()

  return (
    <>
      {/* WhatsApp Button */}
      <a
        href={whatsappURL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-8 right-8 z-40 transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Contact us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        {/* Icon */}
        <div className="relative">
          {/* Glow effect */}
          <div
            className={`absolute inset-0 bg-green-500 rounded-full blur-lg transition-opacity duration-300 ${
              isHovered ? 'opacity-75' : 'opacity-50'
            }`}
          ></div>

          {/* Button */}
          <div className="relative w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors">
            {/* WhatsApp Icon SVG */}
            <svg
              className="w-7 h-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.869 1.171c-1.519.761-2.823 1.993-3.756 3.622-.484.816-.856 1.635-1.081 2.367-.225.732-.315 1.496-.311 2.261.005.765.103 1.528.341 2.267.238.74.623 1.435 1.122 2.056 1.022 1.249 2.366 2.16 3.903 2.619 1.537.46 3.159.505 4.707.133.943-.226 1.831-.61 2.612-1.151 1.036-.732 1.865-1.729 2.383-2.866.258-.576.442-1.181.532-1.792.09-.611.076-1.233-.042-1.844l.06.001c1.473 0 2.812-.576 3.77-1.521.957-.946 1.466-2.253 1.466-3.734 0-1.482-.509-2.789-1.466-3.735-.958-.945-2.297-1.52-3.771-1.52-1.474 0-2.814.575-3.772 1.52-.957.946-1.465 2.253-1.465 3.735 0 .503.054 1.002.161 1.486zm3.85-2.72c1.04 0 1.986.406 2.674 1.082.688.675 1.066 1.61 1.066 2.65 0 1.042-.378 1.977-1.066 2.652-.688.676-1.634 1.082-2.674 1.082-1.041 0-1.987-.406-2.675-1.082-.688-.675-1.066-1.61-1.066-2.652 0-1.041.378-1.976 1.066-2.651.688-.676 1.634-1.082 2.675-1.082z" />
            </svg>
          </div>

          {/* Tooltip on hover */}
          {isHovered && (
            <div className="absolute right-16 bottom-2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg whitespace-nowrap shadow-lg border border-gray-700 pointer-events-none">
              Chat with us
            </div>
          )}
        </div>
      </a>

      {/* Mobile pulse animation */}
      <style jsx>{`
        @media (max-width: 768px) {
          a[aria-label='Contact us on WhatsApp'] {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        }
      `}</style>
    </>
  )
}
