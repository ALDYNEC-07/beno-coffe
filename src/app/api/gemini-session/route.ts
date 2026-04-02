// Ключ остаётся на сервере, клиент получает готовый URL.
// Gemini Live API (bidiGenerateContent) не поддерживает эфемерные токены
// для моделей native-audio — только прямая аутентификация через API key.
const WS_ENDPOINT =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 },
    );
  }

  return Response.json({
    url: `${WS_ENDPOINT}?key=${apiKey}`,
  });
}
