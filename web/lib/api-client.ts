// Tiny fetch wrapper used by client components. Cookies are sent
// automatically for same-origin requests, so no extra auth plumbing needed.
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error((await safeJson(res))?.error ?? `GET ${url} failed`);
  return res.json();
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await safeJson(res))?.error ?? `POST ${url} failed`);
  return res.json();
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
