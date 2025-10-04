/**
 * Utility to create fetch URLs without credentials
 *
 * Browser security prevents fetch() from using URLs with embedded credentials
 * (e.g., https://user:pass@domain.com). This utility strips credentials from
 * the base URL before constructing API endpoints.
 */

/**
 * Get the base URL without credentials for fetch requests
 */
export function getBaseUrl(): string {
  // Strip credentials from URL to avoid browser security error
  return window.location.origin.replace(/\/\/[^@]+@/, '//');
}

/**
 * Create a full URL for API endpoints without credentials
 */
export function apiUrl(path: string): string {
  const base = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * Wrapper around fetch that automatically handles credential stripping
 */
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url: string;

  if (typeof input === 'string') {
    // If it's a relative URL starting with /, prepend clean base
    url = input.startsWith('/') ? apiUrl(input) : input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    // It's a Request object
    url = input.url;
  }

  return fetch(url, init);
}
