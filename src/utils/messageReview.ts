import OpenAI from 'openai';

// Initialize OpenAI client - in production you should use environment variables
// or preferably a Supabase Edge Function to keep your API key secure
const openai = new OpenAI({
  apiKey: 'sk-...', // Replace with your API key in production or use a Supabase Edge Function
  dangerouslyAllowBrowser: true // Only for demo purposes, use server-side in production
});

export async function reviewMessage(message: string): Promise<string> {
  try {
    // In a real app, you'd want to call a Supabase Edge Function here
    // to keep your OpenAI key secure
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that rephrases messages to be kinder and more constructive. Keep the same meaning but make the tone more friendly. Keep responses very concise and similar in length to the original message."
        },
        {
          role: "user",
          content: `Rephrase this message to be kinder: "${message}"`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || message;
  } catch (error) {
    console.error("Error reviewing message:", error);
    return message; // Return original message if there's an error
  }
}
