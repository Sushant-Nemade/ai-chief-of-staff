import { timingSafeEqual } from 'node:crypto';
import { buildBrief } from '../../../../lib/brief.mjs';
export const runtime = 'nodejs';
function validSecret(value: string | null) { const expected = process.env.CRON_SECRET; if (!expected || expected.length < 32 || !value) return false; const a = Buffer.from(expected); const b = Buffer.from(value); return a.length === b.length && timingSafeEqual(a, b); }
export async function POST(request: Request) {
  if (!validSecret(request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const token = process.env.GOOGLE_ACCESS_TOKEN;
  if (!token) return Response.json({ error: 'Google authorization is not configured' }, { status: 503 });
  const now = new Date(); const next = new Date(now.valueOf() + 86400000);
  const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  calendarUrl.searchParams.set('timeMin', now.toISOString()); calendarUrl.searchParams.set('timeMax', next.toISOString()); calendarUrl.searchParams.set('singleEvents', 'true'); calendarUrl.searchParams.set('orderBy', 'startTime'); calendarUrl.searchParams.set('maxResults', '30');
  const headers = { Authorization: `Bearer ${token}` };
  const [eventsResponse, mailResponse] = await Promise.all([fetch(calendarUrl, { headers }), fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is%3Aunread&maxResults=20', { headers })]);
  if (!eventsResponse.ok || !mailResponse.ok) return Response.json({ error: 'Google API request failed' }, { status: 502 });
  const eventData = await eventsResponse.json(); const mailData = await mailResponse.json();
  const events = (eventData.items ?? []).map((item: { summary?: string; start?: { dateTime?: string; date?: string } }) => ({ title: item.summary ?? 'Untitled', start: item.start?.dateTime ?? item.start?.date ?? '' }));
  const ids = (mailData.messages ?? []).slice(0, 20).map((item: { id: string }) => item.id);
  const emails = await Promise.all(ids.map(async (id: string) => { const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=metadata`, { headers }); if (!response.ok) return null; const data = await response.json(); const subject = data.payload?.headers?.find((h: { name: string }) => h.name.toLowerCase() === 'subject')?.value ?? '(no subject)'; return { subject, snippet: String(data.snippet ?? '').slice(0, 300) }; }));
  const brief = buildBrief(events, emails.filter(Boolean));
  const sendgrid = process.env.SENDGRID_API_KEY;
  if (sendgrid && process.env.BRIEF_TO_EMAIL && process.env.BRIEF_FROM_EMAIL) {
    const sent = await fetch('https://api.sendgrid.com/v3/mail/send', { method: 'POST', headers: { Authorization: `Bearer ${sendgrid}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ personalizations: [{ to: [{ email: process.env.BRIEF_TO_EMAIL }] }], from: { email: process.env.BRIEF_FROM_EMAIL }, subject: `Daily brief ${brief.date}`, content: [{ type: 'text/plain', value: `${brief.summary}\n\nSchedule:\n${brief.events.map((e: { start: string; title: string }) => `${e.start} ${e.title}`).join('\n')}\n\nActions:\n${brief.actions.join('\n')}` }] }) });
    if (!sent.ok) return Response.json({ error: 'Email delivery failed' }, { status: 502 });
  }
  return Response.json({ ...brief, delivered: Boolean(sendgrid && process.env.BRIEF_TO_EMAIL && process.env.BRIEF_FROM_EMAIL) });
}
