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
              text: `Write a photo caption for Lewis King's 50th birthday website. About Lewis: bald man, big smile, EY International Tax Partner, UNC Tar Heel, grew up in Murphy NC with brother Stephen, son named Will, lived in Atlanta/London/NYC/Charlotte, studied in Madrid, speaks Spanish, foodie, cocktail lover, famously witty and patient.

If Lewis is in the photo, name him and be witty about what he's doing. Keep it SHORT — one sentence, casual and fun, like these examples:
- "Prost! Lewis living his best life at Oktoberfest — lederhosen and all."
- "Always the life of the party — some things never change!"
- "Like father, like son — Lewis and Will decked out in beads at Mardi Gras!"

Write exactly one sentence. No quotation marks.`
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