export const CLIENT_BASE_URL = 'https://core.vemeet.me/v1';
export const SERVER_BASE_URL = 'http://core-app:8070/v1';
export const WEBSOCKET_URL = 'wss://core.vemeet.me';
export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';
export const COGNITO_ID = 'cognito_id';
export const isProduction = false;

export const endpointsWithoutHeader = ['/messages'];

export function showHeader(pathname: string): boolean {
	for (const endpoint of endpointsWithoutHeader) {
		if (pathname.startsWith(endpoint)) return false;
	}
	return true;
}

export const endpointsWithoutIsland = ['/messages/+'];

export function showIsland(pathname: string): boolean {
	if (pathname === '/messages' || pathname === '/messages/') return true;
	if (pathname.startsWith('/swiper')) return false;

	const messagesRegex = /^\/messages(?:\/\d+)*$/;
	if (messagesRegex.test(pathname)) {
		return false;
	}

	return true;
}
