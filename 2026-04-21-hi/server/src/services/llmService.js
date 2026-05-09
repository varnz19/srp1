import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function explainRecommendation({ user, content, signals = [] }) {
  if (!client) {
    const genre = content.genres?.[0] ? `your interest in ${content.genres[0]}` : 'your taste profile';
    const mood = user.preferences?.moods?.[0] ? ` and ${user.preferences.moods[0]} mood picks` : '';
    return `Recommended because it matches ${genre}${mood}, with strong similarity to your saved behavior.`;
  }

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Write one concise, specific recommendation explanation. No hype, no bullet list.' },
        {
          role: 'user',
          content: JSON.stringify({
            userPreferences: user.preferences,
            content: {
              title: content.title,
              type: content.type,
              genres: content.genres,
              tags: content.tags,
              rating: content.rating
            },
            signals
          })
        }
      ],
      temperature: 0.6,
      max_tokens: 80
    });

    return response.choices[0]?.message?.content || 'Recommended from your preference and behavior profile.';
  } catch (error) {
    console.error('OpenAI explanation error:', error.message);
    const genre = content.genres?.[0] ? `your interest in ${content.genres[0]}` : 'your taste profile';
    const mood = user.preferences?.moods?.[0] ? ` and ${user.preferences.moods[0]} mood picks` : '';
    return `Recommended because it matches ${genre}${mood}, with strong similarity to your saved behavior.`;
  }
}

export async function askRecommendationAssistant({ prompt, user, candidates }) {
  if (!client) {
    return {
      answer: `Based on "${prompt}", start with ${candidates[0]?.title || 'a saved high-match title'} and then try ${candidates[1]?.title || 'another close match'}.`,
      picks: candidates.slice(0, 5)
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise entertainment discovery assistant. Recommend from the provided candidates only and explain why briefly.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            prompt,
            preferences: user.preferences,
            candidates: candidates.slice(0, 12).map((c) => ({
              id: c._id,
              title: c.title,
              type: c.type,
              genres: c.genres,
              tags: c.tags,
              rating: c.rating,
              score: c.score
            }))
          })
        }
      ],
      temperature: 0.7,
      max_tokens: 220
    });
    return { answer: response.choices[0]?.message?.content || 'Here are your best matches.', picks: candidates.slice(0, 5) };
  } catch (error) {
    console.error('OpenAI assistant error:', error.message);
    return {
      answer: `Based on "${prompt}", start with ${candidates[0]?.title || 'a saved high-match title'} and then try ${candidates[1]?.title || 'another close match'}.`,
      picks: candidates.slice(0, 5)
    };
  }
}
