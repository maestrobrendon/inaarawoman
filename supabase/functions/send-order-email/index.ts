// supabase/functions/send-order-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = 're_iaXAyWPi_4MAwpV74xTYisWpbpPHyCu6T'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderEmail {
  to: string
  subject: string
  template: string
  data: {
    customerName: string
    orderNumber: string
    orderDate: string
    items: Array<{
      product_name: string
      quantity: number
      price: number
      image: string
      variant?: any
    }>
    subtotal: number
    shippingFee: number
    total: number
    currency: string
    shippingAddress: {
      address: string
      city: string
      state: string
      country: string
      postalCode: string
    }
    paymentReference: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, data }: OrderEmail = await req.json()

    // Generate HTML email template
    const htmlContent = generateOrderEmailHTML(data)

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Inaara Woman <info@inaarawoman.com>', // Change this to your verified domain
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(result)}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function generateOrderEmailHTML(data: OrderEmail['data']): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    shippingFee,
    total,
    currency,
    shippingAddress,
    paymentReference,
  } = data

  const currencySymbol = getCurrencySymbol(currency)

  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 15px;">
          <img src="${item.image}" alt="${item.product_name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
          <div>
            <p style="margin: 0; font-weight: 600; color: #111827;">${item.product_name}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Quantity: ${item.quantity}</p>
            ${item.variant ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Size: ${item.variant.size || 'N/A'} | Color: ${item.variant.color || 'N/A'}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">
        ${currencySymbol}${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 2px;">INAARA WOMAN</h1>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 28px; font-weight: 600;">Order Confirmed!</h2>
              <p style="margin: 0; color: #6b7280; font-size: 16px;">Thank you for your purchase, ${customerName}</p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table style="width: 100%; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 18px; font-weight: 600; font-family: monospace;">${orderNumber}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Date</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px;">${orderDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment Reference</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; font-family: monospace;">${paymentReference}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${itemsHTML}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 16px;">Subtotal</td>
                  <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 16px;">${currencySymbol}${subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 16px;">Shipping</td>
                  <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 16px;">${shippingFee === 0 ? 'FREE' : `${currencySymbol}${shippingFee.toLocaleString()}`}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 15px 0 0 0; color: #111827; font-size: 18px; font-weight: 700;">Total</td>
                  <td style="padding: 15px 0 0 0; text-align: right; color: #111827; font-size: 20px; font-weight: 700;">${currencySymbol}${total.toLocaleString()}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">Shipping Address</h3>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${customerName}</p>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  ${shippingAddress.address}<br>
                  ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
                  ${shippingAddress.country}
                </p>
              </div>
            </td>
          </tr>

          <!-- Delivery Info -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Estimated Delivery:</strong> Your order will be processed and shipped within 2-3 business days. 
                  You'll receive a tracking number once your order ships.
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="https://inaarawoman.com/orders" style="display: inline-block; padding: 16px 40px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 1px;">
                VIEW ORDER DETAILS
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Questions? Contact us at <a href="mailto:info@inaarawoman.com" style="color: #D4AF37; text-decoration: none;">info@inaarawoman.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Inaara Woman. All rights reserved.
              </p>
              <div style="margin-top: 20px;">
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
                <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px; font-size: 12px;">Shipping Info</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: '₵',
    ZAR: 'R',
  }
  return symbols[currency] || currency
}