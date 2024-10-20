import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatBday(dateString: string): string {
	const date = parseISO(dateString);
	return format(date, 'do MMM. yyyy');
}

export function formatTimestamp(timestamp: string): string {
	return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function calculateAge(birthday: string): number {
	const birthDate = new Date(birthday);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDifference = today.getMonth() - birthDate.getMonth();

	if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	return age;
}

export function formatTimestampShort(timestamp: string): string {
	const formatted = formatDistanceToNow(new Date(timestamp), { addSuffix: true })
		.replace('about ', '')
		.replace(' seconds', 's')
		.replace(' minutes', 'min')
		.replace(' minute', 'min')
		.replace(' hours', 'h')
		.replace(' hour', 'h')
		.replace(' days', 'd')
		.replace(' day', 'd')
		.replace(' months', 'mo')
		.replace(' month', 'mo')
		.replace(' years', 'y')
		.replace(' year', 'y');

	return formatted;
}
