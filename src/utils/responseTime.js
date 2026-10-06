import { useEffect, useState } from 'react';

export const MS_PER_HOUR = 1000 * 60 * 60;
// A ticket whose response time goes beyond this limit is shown in red
export const RESPONSE_LIMIT_HOURS = 24;
export const RESPONSE_LIMIT_MS = RESPONSE_LIMIT_HOURS * MS_PER_HOUR;

// Always shown in hours, e.g. "2.5 h"
export const formatDurationInMs = (ms) => {
  if (ms === null || ms === undefined || isNaN(ms)) return null;
  return `${(Math.max(ms, 0) / MS_PER_HOUR).toFixed(1)} h`;
};

export const isTicketDone = (ticket) => ticket?.statut === 'RESOLU' || ticket?.statut === 'FERME';

// Moment the ticket was resolved (or closed directly)
export const getTicketEndDate = (ticket) => ticket?.dateResolution || ticket?.dateCloture || null;

export const getTicketStart = (ticket) => ticket?.dateCreation || ticket?.createdAt || null;

// Response time of one ticket:
//  - resolved/closed: creation -> resolution (fixed)
//  - still open: creation -> now (keeps growing)
export const getTicketResponse = (ticket, now = Date.now()) => {
  const start = getTicketStart(ticket);
  if (!start) return null;

  const done = isTicketDone(ticket);
  const end = done ? getTicketEndDate(ticket) : now;
  if (!end) return null;

  const ms = Math.max(new Date(end) - new Date(start), 0);
  if (isNaN(ms)) return null;

  return { ms, label: formatDurationInMs(ms), done, overdue: ms > RESPONSE_LIMIT_MS };
};

// Re-renders the component every minute so open tickets keep counting
export const useNow = (intervalMs = 60000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};
