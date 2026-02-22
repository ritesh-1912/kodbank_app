const HF_MODEL = 'microsoft/Phi-2';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

const SYSTEM_PROMPT = `You are KodAI, the Kodbank banking assistant. Answer briefly and helpfully. Only answer questions about the Kodbank app: balance, transfers, cards, UID, transactions, and how to use the app. Do not perform any actions; only explain. If the user asks something unrelated to banking or Kodbank, politely say you can only help with Kodbank. Keep answers short (1-3 sentences).`;

/**
 * POST /api/ai – chat with KodAI (Hugging Face Inference API)
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

    const inputs = `${SYSTEM_PROMPT}\n\nUser: ${trimmed}\n\nAssistant:`;

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs,
        parameters: {
          max_new_tokens: 256,
          return_full_text: false,
          do_sample: true,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = 'KodAI is busy. Please try again in a moment.';
      if (response.status === 503) msg = 'KodAI is loading. Please try again in 10–20 seconds.';
      else if (response.status === 401) msg = 'KodAI is not configured correctly.';
      console.error('HF Inference API error:', response.status, errText);
      return res.status(response.status === 401 ? 503 : 502).json({ success: false, message: msg });
    }

    const data = await response.json();
    const generated = Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text.trim()
      : (data?.generated_text ?? '').trim();

    res.json({ success: true, reply: generated || 'I couldn\'t generate a reply. Please try again.' });
  } catch (err) {
    console.error('KodAI chat error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Something went wrong. Please try again.'
    });
  }
};
