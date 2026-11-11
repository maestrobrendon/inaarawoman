// POST /api/send-order-email  { to, subject, data }
// Replaces the Supabase edge function of the same name. Sends the order
// confirmation through Resend. It only sends for a real order that was just
// placed with this email address, so the endpoint can't be used to spam.
import { db, json } from './_lib/db.js';
import { generateOrderEmailHTML, type EmailData, type StoreContact } from './_lib/orderEmail.js';

const FROM_ADDRESS = 'noreply@inaarawoman.com';
const CONTACT_DEFAULTS: StoreContact = { name: 'Inaara Woman', email: 'info.inaarawoman@gmail.com', phone: '', whatsapp: '' };

async function loadStoreContact(): Promise<StoreContact> {
  try {
    const { rows } = await db().query(
      `select key, value from store_settings where key = any($1)`,
      [['store_name', 'store_email', 'store_phone', 'store_whatsapp']]
    );
    const get = (k: string) => {
      const v = rows.find((r) => r.key === k)?.value;
      if (v == null) return '';
      if (typeof v === 'string') {
        try {
          const parsed = JSON.parse(v);
          return typeof parsed === 'string' ? parsed : v;
        } catch {
          return v;
        }
      }
      return String(v);
    };
    return {
      name: get('store_name') || CONTACT_DEFAULTS.name,
      email: get('store_email') || CONTACT_DEFAULTS.email,
      phone: get('store_phone'),
      whatsapp: get('store_whatsapp') || get('store_phone'),
    };
  } catch {
    return CONTACT_DEFAULTS;
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not configured');
    const { to, subject, data } = (await req.json()) as { to: string; subject?: string; data: EmailData };
    if (typeof to !== 'string' || !data?.orderNumber) return json({ error: 'to and data.orderNumber are required' }, 400);

    const { rowCount } = await db().query(
      `select 1 from orders where order_number=$1 and lower(customer_email)=lower($2) and created_at > now() - interval '2 hours'`,
      [data.orderNumber, to]
    );
    if (!rowCount) return json({ error: 'No matching recent order' }, 404);

    const contact = await loadStoreContact();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: `${contact.name} <${FROM_ADDRESS}>`,
        to: [to],
        subject: subject || `Order Confirmation - ${data.orderNumber}`,
        html: generateOrderEmailHTML(data, contact),
        reply_to: contact.email,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Resend API error:', result);
      return json({ error: `Resend API error: ${JSON.stringify(result)}` }, 502);
    }
    return json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending email:', error);
    return json({ error: (error as Error).message }, 400);
  }
}
