// Vercel serverless function – handles all /api/* routes
// Backend deps must be in root package.json so this bundle can resolve them

let app;

async function getApp() {
  if (app) return app;
  const mod = await import('../backend/src/server.js');
  app = mod.default;
  return app;
}

export default async function handler(req, res) {
  try {
    const application = await getApp();
    application(req, res);
  } catch (err) {
    console.error('API handler error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      ...(process.env.VERCEL !== '1' && { error: err.message })
    });
  }
}
