export type Event = { start: string; title: string };
export type Message = { subject: string; snippet: string };
export type Brief = { date: string; events: Event[]; priority: Message[]; actions: string[]; summary: string };
export function buildBrief(events: Event[], messages: Message[], day?: string | Date): Brief;
