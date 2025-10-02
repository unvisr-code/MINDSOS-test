import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // If OpenAI is not configured, return mock response
    if (!openai) {
      const mockResponses = [
        '이야기를 들려주셔서 감사합니다. 그런 감정을 느끼는 것은 자연스러운 일이에요. 자신에게 조금 더 관대해지는 것은 어떨까요? 당신의 감정을 충분히 인정해주세요.',
        '힘든 상황이네요. 하지만 이렇게 이야기를 나누는 것만으로도 큰 용기예요. 작은 것부터 시작해보세요. 당신은 충분히 잘하고 있습니다.',
        '충분히 공감이 갑니다. 지금 느끼는 감정들을 그대로 받아들이는 것부터 시작해보면 어떨까요? 스스로에게 친절해지는 연습을 해보세요.',
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      return NextResponse.json({
        success: true,
        response: randomResponse
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `당신은 전문적이고 따뜻한 마음 치유 코치입니다.
사용자의 고민을 경청하고, 공감하며, 실질적인 조언과 위로를 제공합니다.
답변은 친근하고 공감적인 어조로 작성하되, 전문적인 조언을 포함해주세요.
답변 길이는 200-300자 정도로 해주세요.`,
        },
        {
          role: 'user',
          content: `제목: ${title}\n\n내용: ${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || '답변을 생성할 수 없습니다.';

    return NextResponse.json({
      success: true,
      response: aiResponse
    });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
