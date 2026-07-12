// Facebook Conversions API proxy — server-side event tracking
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PIXEL_ID = Deno.env.get('FB_PIXEL_ID') ?? '1419865112929170';
const ACCESS_TOKEN = Deno.env.get('FB_CAPI_ACCESS_TOKEN');

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: 'FB_CAPI_ACCESS_TOKEN not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      event_name,
      event_id,
      event_source_url,
      user_agent,
      fbp,
      fbc,
      email,
      phone,
      custom_data,
      test_event_code,
    } = body as Record<string, string | undefined> & { custom_data?: Record<string, unknown> };

    if (!event_name) {
      return new Response(JSON.stringify({ error: 'event_name is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const xff = req.headers.get('x-forwarded-for') ?? '';
    const client_ip_address = xff.split(',')[0].trim() || undefined;
    const client_user_agent = user_agent || req.headers.get('user-agent') || undefined;

    const user_data: Record<string, unknown> = {};
    if (client_ip_address) user_data.client_ip_address = client_ip_address;
    if (client_user_agent) user_data.client_user_agent = client_user_agent;
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;
    if (email) user_data.em = [await sha256(email)];
    if (phone) user_data.ph = [await sha256(phone.replace(/[^0-9]/g, ''))];

    const payload: Record<string, unknown> = {
      data: [{
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        event_source_url,
        action_source: 'website',
        user_data,
        custom_data: custom_data ?? {},
      }],
    };
    if (test_event_code) payload.test_event_code = test_event_code;

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const fbRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await fbRes.json();
    console.log('FB CAPI', event_name, 'test=', test_event_code ?? 'no', 'status=', fbRes.status, JSON.stringify(result));

    return new Response(JSON.stringify({ ok: fbRes.ok, result }), {
      status: fbRes.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
