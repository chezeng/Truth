import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDebateContent(topic: string, userProfile?: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a debate content generator. Generate balanced arguments for both supporting and opposing views."
        },
        {
          role: "user",
          content: `Generate a debate content for the topic: "${topic}". Include:
            1. A brief description
            2. Supporting view (red side)
            3. Opposing view (blue side)
            ${userProfile ? `Consider the user's background: ${userProfile.occupation} with interests in ${userProfile.interests.join(', ')}` : ''}`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating debate content:', error);
    throw error;
  }
} 