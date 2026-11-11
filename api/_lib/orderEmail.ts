// Order-confirmation email template (moved unchanged from the old Supabase
// function supabase/functions/send-order-email/index.ts).

export interface StoreContact {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface EmailData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    image: string;
    variant?: { size?: string; color?: string } | null;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentReference: string;
}

export function generateOrderEmailHTML(data: EmailData, contact: StoreContact): string {
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
  } = data;

  const currencySymbol = getCurrencySymbol(currency);
  const waDigits = contact.whatsapp.replace(/[^\d]/g, '');
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Hi ${contact.name}, I have a question about my order ${orderNumber}.`,
      )}`
    : '';
  const telHref = contact.phone ? `tel:${contact.phone.replace(/\s+/g, '')}` : '';

  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 15px; align-items: center;">
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
  `,
    )
    .join('');

  const contactRows = [
    `<a href="mailto:${contact.email}" style="color: #D4AF37; text-decoration: none;">${contact.email}</a>`,
    telHref ? `<a href="${telHref}" style="color: #D4AF37; text-decoration: none;">${contact.phone}</a>` : '',
  ]
    .filter(Boolean)
    .join('&nbsp;&nbsp;·&nbsp;&nbsp;');

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
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 2px;">${contact.name.toUpperCase()}</h1>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 32px;">&check;</span>
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
                  <td style="padding: 10px 0; text-align: right; color: #10b981; font-size: 16px; font-weight: 600;">${shippingFee === 0 ? 'FREE' : `${currencySymbol}${shippingFee.toLocaleString()}`}</td>
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

          <!-- Need help / follow-up -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 24px; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 16px; font-weight: 700;">Need help with your order?</h3>
                <p style="margin: 0 0 16px 0; color: #047857; font-size: 14px;">
                  Quote your order number <strong>${orderNumber}</strong> and our team will assist you.
                </p>
                ${
                  waHref
                    ? `<a href="${waHref}" style="display: inline-block; padding: 12px 28px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">Chat on WhatsApp</a>
                       <p style="margin: 12px 0 0 0; color: #047857; font-size: 13px;">WhatsApp: ${contact.whatsapp}</p>`
                    : ''
                }
                <p style="margin: 14px 0 0 0; color: #047857; font-size: 13px;">${contactRows}</p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="https://inaarawoman.com/shop" style="display: inline-block; padding: 16px 40px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                CONTINUE SHOPPING
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Questions? ${contactRows}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${contact.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: '₵',
    ZAR: 'R',
  };
  return symbols[currency] || currency;
}
