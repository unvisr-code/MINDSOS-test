import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
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
