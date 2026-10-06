import { getTicketResponse, useNow, RESPONSE_LIMIT_HOURS } from '../utils/responseTime';

// Shows the response time of a ticket in hours. Turns red after 24 hours.
export default function ResponseTimeBadge({ ticket, className = '' }) {
  const now = useNow();
  const response = getTicketResponse(ticket, now);

  if (!response) {
    return <span className={`text-gray-400 italic text-xs ${className}`}>--</span>;
  }

  const color = response.overdue
    ? 'bg-red-50 text-red-700 border-red-300'
    : response.done
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-sky-50 text-sky-800 border-sky-200';

  const title = response.overdue
    ? `Dépasse ${RESPONSE_LIMIT_HOURS} h`
    : response.done
      ? 'Temps entre la création et la résolution'
      : 'Temps écoulé depuis la création (en cours)';

  return (
    <span
      title={title}
      className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs inline-flex items-center gap-1 whitespace-nowrap ${color} ${className}`}
    >
      {response.overdue ? '⚠️' : '⏱️'} {response.label}
    </span>
  );
}
