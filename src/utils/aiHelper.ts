export async function callGeminiApi(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        model: 'gemini-3.6-flash',
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data.text || 'No diagnostic output received.';
  } catch (err: any) {
    console.warn('Gemini API call warning:', err.message);
    throw err;
  }
}
