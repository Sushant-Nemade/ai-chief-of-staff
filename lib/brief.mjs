export function buildBrief(events, messages, day = new Date()) {
  const sorted = [...events].sort((a, b) => String(a.start).localeCompare(String(b.start)));
  const priority = messages.filter(m => /urgent|deadline|review|reply|proposal|action/i.test(`${m.subject} ${m.snippet}`));
  return { date: new Date(day).toISOString().slice(0, 10), events: sorted, priority, actions: priority.map(m => `Review: ${m.subject}`), summary: `${sorted.length} calendar event(s) and ${messages.length} unread message(s) in the next brief.` };
}
