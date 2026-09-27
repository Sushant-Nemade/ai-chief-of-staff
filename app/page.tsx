'use client';
import { useMemo, useState } from 'react';
import { buildBrief } from '../lib/brief.mjs';
const events = [{ start: '09:00', title: 'Team planning' }, { start: '14:30', title: 'Client review' }];
const messages = [{ subject: 'Review the proposal', snippet: 'Please send feedback today' }, { subject: 'Weekly newsletter', snippet: 'News and updates' }];
export default function Page() {
  const [schedule, setSchedule] = useState(events);
  const [inbox, setInbox] = useState(messages);
  const [eventText, setEventText] = useState('');
  const [subject, setSubject] = useState('');
  const brief = useMemo(() => buildBrief(schedule, inbox), [schedule, inbox]);
  return <main><div className="eyebrow">DAILY PLANNING · SAMPLE BRIEF</div><header><h1>AI Chief of Staff</h1><p>A morning view of schedule, priority messages, and actions. This public preview uses fictional data.</p></header><div className="grid"><article><span className="muted">Meetings</span><div className="metric">{brief.events.length}</div></article><article><span className="muted">Priority messages</span><div className="metric">{brief.priority.length}</div></article></div><section><span className="pill">{brief.date}</span><h2>Your daily brief</h2><p>{brief.summary}</p><h3>Schedule</h3><ul>{brief.events.map(e => <li key={`${e.start}-${e.title}`}>{e.start} · {e.title}</li>)}</ul><h3>Action plan</h3><ul>{brief.actions.map(a => <li key={a}>{a}</li>)}</ul></section><section><h2>Explore the demo</h2><div className="grid"><label>Add event<input type="text" placeholder="e.g. 16:00 Project review" value={eventText} onChange={e => setEventText(e.target.value)} /></label><label>Add email subject<input type="text" value={subject} onChange={e => setSubject(e.target.value)} /></label></div><div className="row"><button onClick={() => { if (eventText.trim()) { setSchedule([...schedule, { start: eventText.slice(0, 5), title: eventText.slice(6) || eventText }]); setEventText(''); } }}>Add event</button><button className="secondary" onClick={() => { if (subject.trim()) { setInbox([...inbox, { subject, snippet: '' }]); setSubject(''); } }}>Add message</button></div></section><footer>Gmail, Calendar, and email dispatch require OAuth credentials and explicit configuration. The daily GitHub Action is disabled by default.</footer></main>;
}
