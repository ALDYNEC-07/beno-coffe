import https from "https";

const WS_ENDPOINT =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained";

const SESSION_EXPIRE_MINUTES = 30;
const NEW_SESSION_EXPIRE_MINUTES = 2;

function httpsPost(
  url: string,
  body: string,
): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, data }));
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 },
    );
  }

  const now = Date.now();
  const expireTime = new Date(
    now + SESSION_EXPIRE_MINUTES * 60 * 1000,
  ).toISOString();
  const newSessionExpireTime = new Date(
    now + NEW_SESSION_EXPIRE_MINUTES * 60 * 1000,
  ).toISOString();

  const body = JSON.stringify({ uses: 1, expireTime, newSessionExpireTime });

  const { status, data } = await httpsPost(
    `https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${apiKey}`,
    body,
  );

  if (status < 200 || status >= 300) {
    return Response.json(
      { error: "Failed to create ephemeral token", detail: data },
      { status: 500 },
    );
  }

  const token = JSON.parse(data) as { name: string };

  return Response.json({
    url: `${WS_ENDPOINT}?access_token=${token.name}`,
  });
}
