import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatMemberSince(dateString: string): string {
	const date = parseISO(dateString);
	return format(date, 'do MMM. yyyy');
}

export function formatTimestamp(timestamp: string): string {
	return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}
