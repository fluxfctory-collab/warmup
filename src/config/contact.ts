/**
 * Contact form connection settings. No contact method was supplied with the
 * brief, so the form is not connected: while `endpoint` is null, submitting a
 * valid form shows an honest "not sent" message and nothing leaves the page.
 *
 * To connect it, set `endpoint` to a URL that accepts a JSON POST of
 * { name, email, organisation, message } and returns a 2xx status on success.
 */
export const contactConfig: {
  endpoint: string | null;
  method: 'POST';
  headers: Record<string, string>;
} = {
  endpoint: null,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
};
