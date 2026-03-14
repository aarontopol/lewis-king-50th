export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { image, mediaType } = req.body;

    if (!image || !mediaType) {
      return res.status(400).json({ error: 'Missing image or mediaType' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 40,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: image
              }
            },
            {
              type: 'text',
              text: `Photo caption for Lewis King's 50th birthday site. Lewis: bald, big smile, EY tax partner, UNC Tar Heel, son Will, foodie.

STRICT RULES:
- MAX 10 words
- One short fragment or sentence
- Witty and warm
- If Lewis is visible, mention him by name
- No quotation marks

Examples of PERFECT length: "Lewis in his element!" or "The King brothers hit the town." or "Prost! Lederhosen and all."`
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'API error' });
    }

    const caption = data.content?.[0]?.text || '';
    return res.status(200).json({ caption });

  } catch (err) {
    console.error('Caption API error:', err);
    return res.status(500).json({ error: 'Failed to generate caption' });
  }
}