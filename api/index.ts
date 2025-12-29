// File: /api/index.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ⚠️ MOVE THIS TO AN ENV VAR IN PRODUCTION
const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1455249506844016811/ws8UVleB2RoXpzozn0dqgfv3hZmRGRu8gWFT1Qo09OJzPmUquYNHeBFok6rvu0d_3Rn1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'Unknown';

  const userAgent = req.headers['user-agent'] || 'N/A';

  // --- 1. Send Discord Webhook ---
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'IP Logger',
        avatar_url: 'https://i.imgur.com/4M34hi2.png',
        embeds: [
          {
            title: '📍 New Visitor Detected!',
            color: 0x0099ff,
            fields: [
              {
                name: 'IP Address',
                value: `\`${ip}\``,
                inline: true,
              },
              {
                name: 'User Agent',
                value: `\`${userAgent}\``,
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error('Webhook failed:', err);
  }

  // --- 2. Return HTML page ---
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IP Check</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,.1);
      max-width: 500px;
      text-align: center;
    }
    .ip {
      font-family: monospace;
      background: #eef7ff;
      padding: 10px;
      border-radius: 6px;
      color: #0070f3;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Your IP Address</h1>
    <p>Your visit has been logged.</p>
    <div class="ip">${ip}</div>
  </div>
</body>
</html>
`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
