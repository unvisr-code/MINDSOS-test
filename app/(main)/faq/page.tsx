'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockFAQs } from '@/lib/mockData';

export default function FAQPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">FAQ</h1>
        </div>
      </div>

      {/* FAQ List */}
      <div className="px-6 py-6 space-y-3">
        {mockFAQs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">
                  {faq.question}
                </h3>
              </div>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              )}
            </button>

            {openIndex === index && (
              <div className="px-5 pb-4 pl-16">
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="px-6 pb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6">
          <h3 className="font-semibold mb-2">추가 문의가 있으신가요?</h3>
          <p className="text-sm opacity-90 mb-4">
            더 궁금하신 사항이 있다면 언제든 문의해주세요
          </p>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors">
            문의하기
          </button>
        </div>
      </div>
    </div>
  );
}
