import { format, parseISO } from 'date-fns';

export function formatMemberSince(dateString: string): string {
	const date = parseISO(dateString);
	return format(date, 'do MMM. yyyy');
}
