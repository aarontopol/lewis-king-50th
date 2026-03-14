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
        max_tokens: 150,
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
              text: `You are writing a photo caption for a 50th birthday celebration website for Lewis King. Here is what you need to know about Lewis:

- He is a bald/balding man, often smiling, with a warm and friendly face
- He is an International Tax Partner at EY (Ernst & Young)
- He is a proud UNC Chapel Hill Tar Heel
- He grew up in Murphy, North Carolina with his brother Stephen
- He has a son named Will
- He lived and worked in Atlanta, London, New York, Charlotte, and studied abroad in Madrid
- He speaks fluent Spanish
- He is a self-described foodie and cocktail connoisseur
- He was designated "The Most Patient Man in New York" in 2024
- He is known for his legendary wit, warmth, and patience

If Lewis appears in the photo, mention him by name and be witty about what he is doing. If Lewis is not in the photo, write a warm caption that ties the photo to his celebration.

Write exactly ONE short, witty, warm caption (1-2 sentences max). Do NOT use quotation marks around the caption. Be clever and fun — match Lewis's legendary wit.`
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