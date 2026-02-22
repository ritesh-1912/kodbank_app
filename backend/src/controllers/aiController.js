// Hugging Face Inference API – we use a model from Hugging Face (see https://huggingface.co/inference-api)
const HF_MODEL = 'google/flan-t5-base';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

const SYSTEM_PROMPT = `You are KodAI, the Kodbank banking assistant. Answer briefly. Only answer questions about the Kodbank app: balance, transfers, cards, UID, transactions. Do not perform actions; only explain. If the question is not about Kodbank, say you can only help with Kodbank. Keep answers to 1-3 sentences.`;

/**
 * POST /api/ai – chat with KodAI (Hugging Face Inference API – uses a Hugging Face model)
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

    const inputs = `${SYSTEM_PROMPT}\n\nQuestion: ${trimmed}\n\nAnswer:`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs,
        parameters: {
          max_length: 150,
          min_length: 10,
          do_sample: false
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      let msg = 'KodAI is busy. Please try again in a moment.';
      if (response.status === 503) msg = 'KodAI is loading. Please try again in 10–20 seconds.';
      else if (response.status === 401) msg = 'KodAI is not configured correctly. Check HUGGINGFACE_TOKEN.';
      else if (response.status === 429) msg = 'Too many requests. Please wait a minute and try again.';
      else if (response.status >= 500) msg = 'KodAI service is temporarily unavailable. Try again in a few seconds.';
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error && typeof errJson.error === 'string') msg = errJson.error;
      } catch (_) {}
      console.error('HF Inference API error:', response.status, errText);
      const status = response.status === 401 ? 503 : (response.status === 429 ? 429 : 502);
      return res.status(status).json({ success: false, message: msg });
    }

    const data = await response.json();
    const generated = Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text.trim()
      : (data?.generated_text ?? '').trim();

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
