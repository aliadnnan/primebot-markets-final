import { Resend } from 'resend'

const adminEmail = process.env.ADMIN_EMAIL || 'chadnan76@gmail.com'
const emailFrom = process.env.EMAIL_FROM || 'noreply@primebot-markets.com'

/**
 * Lazily created Resend client.
 *
 * `new Resend(undefined)` throws "Missing API key". Because this module is
 * imported by API routes, doing that at module scope made `next build` fail
 * outright whenever RESEND_API_KEY was not set at build time - which is the
 * default on a fresh Vercel project. Creating the client on first use keeps the
 * build green and turns a missing key into a skipped email instead of a crash.
 */
let resendClient: Resend | null = null

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export interface EmailParams {
  to: string
  subject: string
  html: string
}

// Send email function
export async function sendEmail({ to, subject, html }: EmailParams) {
  const resend = getResend()

  // Email is an optional integration. Without a key, skip sending rather than
  // failing the surrounding operation (e.g. approving an order).
  if (!resend) {
    console.warn('RESEND_API_KEY is not set - skipping email to', to)
    return null
  }

  try {
    const response = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    })

    console.log('Email sent:', response)
    return response
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// New order confirmation email (to customer)
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  botName: string,
  botPrice: number,
  paymentMethod: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">🎉 Order Received!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Hi ${customerName},</p>
        
        <p>Thank you for your order! We've received your purchase request.</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Product:</strong> ${botName}</p>
          <p><strong>Price:</strong> $${botPrice}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        </div>
        
        <h3>What's Next?</h3>
        <ol>
          <li>Review the payment details you submitted</li>
          <li>Our team will verify your payment within 24 hours</li>
          <li>Once approved, you'll receive download instructions</li>
          <li>Check your email for payment confirmation</li>
        </ol>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Status: Pending Verification</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Your payment is being verified by our admin team.</p>
        </div>
        
        <p>If you have any questions, contact us at ${adminEmail}</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated email. Please do not reply directly.
        </p>
      </div>
    </div>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - ${orderId}`,
    html,
  })
}

// Payment submitted email (to customer)
export async function sendPaymentSubmittedEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  botName: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">💳 Payment Received</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Hi ${customerName},</p>
        
        <p>We've received your payment information for <strong>${botName}</strong>.</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details Submitted</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Product:</strong> ${botName}</p>
          <p><strong>Current Status:</strong> ⏳ Pending Verification</p>
        </div>
        
        <p>Our payment verification team is reviewing your submission. You'll receive another email within 24 hours with the verification result.</p>
        
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>✓ We verify your payment</li>
          <li>✓ We confirm the transaction</li>
          <li>✓ We send you download instructions</li>
        </ul>
        
        <p>Thank you for your patience!</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated email. Please do not reply directly.
        </p>
      </div>
    </div>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Payment Submitted - Order ${orderId}`,
    html,
  })
}

// Payment approved email (to customer)
export async function sendPaymentApprovedEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  botName: string,
  downloadLink?: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">✅ Payment Approved!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Hi ${customerName},</p>
        
        <p>Great news! Your payment has been verified and approved. 🎉</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="margin-top: 0;">✓ Payment Verified</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Product:</strong> ${botName}</p>
          <p><strong>Status:</strong> ✅ Verified</p>
        </div>
        
        <p><strong>Your next steps:</strong></p>
        <ol>
          <li>Download your ${botName} EA file</li>
          <li>Follow the setup instructions (included in download)</li>
          <li>Start automated trading</li>
        </ol>
        
        ${downloadLink ? `<a href="${downloadLink}" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">📥 Download Your EA</a>` : '<p><strong>📥 Download Instructions:</strong> Check your account for the download link.</p>'}
        
        <p>If you need setup help, contact us at ${adminEmail}</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated email. Please do not reply directly.
        </p>
      </div>
    </div>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Payment Approved - Download Your ${botName}`,
    html,
  })
}

// Payment rejected email (to customer)
export async function sendPaymentRejectedEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  botName: string,
  rejectionReason?: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">❌ Payment Verification Failed</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>Hi ${customerName},</p>
        
        <p>Unfortunately, we were unable to verify your payment. Please review the details below:</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Product:</strong> ${botName}</p>
          <p><strong>Status:</strong> ❌ Rejected</p>
          ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        </div>
        
        <p><strong>What you can do:</strong></p>
        <ul>
          <li>Double-check your transaction ID is correct</li>
          <li>Verify you sent the exact payment amount</li>
          <li>Ensure the screenshot shows the complete transaction</li>
          <li>Contact support for help</li>
        </ul>
        
        <p>You can place a new order or contact us at ${adminEmail} to resolve this issue.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated email. Please do not reply directly.
        </p>
      </div>
    </div>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Payment Verification Failed - Order ${orderId}`,
    html,
  })
}

// Admin notification email (new order)
export async function sendAdminNotificationNewOrder(
  orderId: string,
  customerName: string,
  customerEmail: string,
  botName: string,
  paymentMethod: string,
  transactionId: string
) {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${orderId}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">🔔 New Order Pending Verification</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
        <p>A new order is pending your verification:</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Information</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Product:</strong> ${botName}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Status:</strong> ⏳ Pending Verification</p>
        </div>
        
        <p><a href="${dashboardLink}" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📊 Review in Admin Dashboard</a></p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Log in to your admin dashboard to view the payment proof and make a decision.
        </p>
      </div>
    </div>
  `

  return sendEmail({
    to: adminEmail,
    subject: `[ADMIN] New Order Pending - ${orderId}`,
    html,
  })
}
