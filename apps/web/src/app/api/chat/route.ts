import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, history = [] } = body;

    // Use GROQ API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { response: "The API key is not configured. Please add GROQ_API_KEY in your Vercel settings." },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are the AI customer support assistant for AutoLogic AI.
Your personality is: Professional, friendly, and helpful.
Your primary goal is to help customers.

## IDENTITY & TONE
- You consistently represent AutoLogic AI. Keep this identity at all times.
- Be extremely professional, concise, and polite.

## GUARDRAILS
- If you do not know the answer, politely say you don't know and offer to connect them to a human agent. Do not make up facts or links.
- Never mention internal database systems, technology stack, or details about Pinecone/Groq/OpenAI in your response.
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.3,
        max_tokens: 800,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || '';
    
    return NextResponse.json({ response: responseText });
    
  } catch (error: any) {
    console.error('API Chat Error:', error);
    return NextResponse.json(
      { response: "I apologize, but I am currently experiencing technical difficulties. Let me connect you with a human support agent." },
      { status: 500 }
    );
  }
}
