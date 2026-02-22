// Hugging Face Router API (https://router.huggingface.co) – chat completions
const HF_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';
// Use :fastest so the router picks an enabled provider. Enable providers at https://huggingface.co/settings/inference-providers
const HF_MODEL = 'meta-llama/Llama-3.2-1B-Instruct:fastest';

const SYSTEM_PROMPT = `You are KodAI, the assistant for Kodbank. Kodbank is a web app (website), not a mobile app. Only use the facts below. Do not invent menus, tabs, or features. If unsure, say "In Kodbank you can..." and stick to this list.

Facts about Kodbank:
- It is a web application in a browser. There is no separate mobile app.
- After login you see a Dashboard with: Total Balance (use "Check Balance" to see it, and "Show"/"Hide" to toggle visibility), "Send Money" (transfer to another user by username or UID), "Ask KodAI" (this chat), My Cards (card list and "+ Add card"), and Recent Transactions (list with type and search filters).
- Registration: you enter username, email, password, phone. After signup you get a numeric Customer ID (UID) on the next screen; save it. You sign in with username and password.
- Transfers: use "Send Money" on the dashboard, enter recipient username or UID, amount in rupees (₹), and optional note.
- Cards: each card shows last 4 digits, type (Debit/Credit), brand (Visa/Mastercard). You can add more cards with "+ Add card".
- Transactions: list shows credit/debit, description, amount, date. You can filter by type (All/Credit/Debit) and search by description.

Rules: Answer in 1-3 short sentences. Only describe Kodbank as above. Do not mention other apps, "Laporan", "Account tab", or features not in this list. If the user asks something not about Kodbank, say you can only help with Kodbank.`;

/**
 * POST /api/ai – chat with KodAI (Hugging Face Router – chat completions API)
 * Body: { message: string }
 */
export const chat = async (req, res) => {
  try {
    const message = req.body?.message;
    const trimmed = typeof message === 'string' ? message.trim() : '';
    if (!trimmed) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const token = process.env.HUGGINGFACE_TOKEN;
    if (!token) {
      return res.status(503).json({
        success: false,
        message: 'KodAI is not configured. Add HUGGINGFACE_TOKEN to the server environment.'
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(HF_CHAT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: trimmed }
        ],
        max_tokens: 256,
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      let msg = 'KodAI is busy. Please try again in a moment.';
      if (response.status === 503) msg = 'KodAI is loading. Please try again in 10–20 seconds.';
      else if (response.status === 401) msg = 'KodAI is not configured correctly. Check HUGGINGFACE_TOKEN.';
      else if (response.status === 400 && errText.toLowerCase().includes('not supported by any provider')) msg = 'No inference provider enabled. Go to Hugging Face → Settings → Inference Providers and enable at least one provider (e.g. HF Inference).';
      else if (response.status === 429) msg = 'Too many requests. Please wait a minute and try again.';
      else if (response.status >= 500) msg = 'KodAI service is temporarily unavailable. Try again in a few seconds.';
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.message) msg = errJson.error.message;
        else if (errJson.error && typeof errJson.error === 'string') msg = errJson.error;
        if ((errText + (errJson.error?.message || '') + (errJson.error || '')).toLowerCase().includes('not supported by any provider')) {
          msg = 'No inference provider enabled. Go to Hugging Face → Settings → Inference Providers and enable at least one provider (e.g. HF Inference).';
        }
      } catch (_) {}
      console.error('HF Router API error:', response.status, errText);
      const status = response.status === 401 ? 503 : (response.status === 429 ? 429 : 502);
      return res.status(status).json({ success: false, message: msg });
    }

    const data = await response.json();
    const generated = data?.choices?.[0]?.message?.content?.trim() ?? '';

    res.json({
      success: true,
      reply: generated || 'I couldn\'t generate a reply. Please try again.',
      model: HF_MODEL
    });
  } catch (err) {
    console.error('KodAI chat error:', err);
    const msg = err.name === 'AbortError'
      ? 'KodAI took too long to respond. Please try again.'
      : (err.message || 'Something went wrong. Please try again.');
    res.status(500).json({ success: false, message: msg });
  }
};
