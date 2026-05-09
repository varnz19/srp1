import OpenAI from 'openai';

const fallbackGenres = ['sci-fi', 'science fiction', 'drama', 'comedy', 'thriller', 'romance', 'action', 'animation', 'horror', 'mystery'];
const fallbackMoods = ['happy', 'dark', 'thrilling', 'emotional', 'chill'];
const durationHints = [
  { phrase: 'shorter', maxDurationMinutes: 120 },
  { phrase: 'under 2 hours', maxDurationMinutes: 120 },
  { phrase: 'under two hours', maxDurationMinutes: 120 },
  { phrase: 'long', minDurationMinutes: 140 }
];

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function fallbackIntent(query = '') {
  const text = query.toLowerCase();
  const genres = fallbackGenres.filter((genre) => text.includes(genre)).map((genre) => (genre === 'science fiction' ? 'Sci-Fi' : genre.replace(/\b\w/g, (match) => match.toUpperCase())));
  const moods = fallbackMoods.filter((mood) => text.includes(mood));
  const referenceMatch = text.match(/like ([a-z0-9 :'-]+)/i);
  const duration = durationHints.find((hint) => text.includes(hint.phrase));
  return {
    genres,
    moods,
    similarTo: referenceMatch ? [referenceMatch[1].trim()] : [],
    maxDurationMinutes: duration?.maxDurationMinutes,
    minDurationMinutes: duration?.minDurationMinutes,
    rawQuery: query
  };
}

export async function extractIntent(query = '') {
  if (!openai) return fallbackIntent(query);

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Extract entertainment search intent as JSON with keys genres, moods, similarTo, maxDurationMinutes, minDurationMinutes, contentTypes.' },
        { role: 'user', content: query }
      ]
    });
    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      genres: parsed.genres || [],
      moods: parsed.moods || [],
      similarTo: parsed.similarTo || [],
      maxDurationMinutes: parsed.maxDurationMinutes || undefined,
      minDurationMinutes: parsed.minDurationMinutes || undefined,
      contentTypes: parsed.contentTypes || [],
      rawQuery: query
    };
  } catch {
    return fallbackIntent(query);
  }
}
