'use client'

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I sign up as a donor?",
    answer:
      "Simply click the 'I'm Ready to Help' button and follow the WhatsApp prompts. You'll provide basic information including your blood type, contact details, and location. The entire process takes less than 2 minutes.",
  },
  {
    question: "How often can I donate?",
    answer:
      "You can donate whole blood every 3 months (12 weeks). For platelet donations, you can donate every 2 weeks. We'll send you reminders when you're eligible to donate again.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Absolutely. We use end-to-end encryption and only share your contact information with verified hospitals when there's a matching blood request. Your data is never sold or shared with third parties.",
  },
  {
    question: "How does the hospital request process work?",
    answer:
      "When a hospital needs blood, they submit a request through our system specifying the blood type needed. We then notify compatible donors in the area via WhatsApp. Donors can respond if they're available to help.",
  },
  {
    question: "Can I donate if I have health conditions?",
    answer:
      "It depends on the condition. Common disqualifiers include recent tattoos, certain medications, low iron levels, or active infections. When you sign up, we'll ask screening questions, and hospitals will do a final check before donation.",
  },
  {
    question: "What happens after I confirm I can donate?",
    answer:
      "Once you confirm availability, the hospital will contact you directly with the location and time. You'll go to the hospital or blood bank, undergo a quick health screening, and then donate. The entire process usually takes 45-60 minutes.",
  },
  {
    question: "Is there a cost to use Lifesaver?",
    answer:
      "No, Lifesaver is completely free for donors. We believe saving lives should be accessible to everyone. Hospitals pay a small subscription fee to access our network of verified donors.",
  },
  {
    question: "How are donors verified?",
    answer:
      "We verify donors through phone number authentication, blood type documentation (if available), and maintain a track record of successful donations. Hospitals also conduct their own screening before accepting donations.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="w-full bg-black text-white py-20 px-6">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-[52px]">Frequently Asked Questions</h2>
        <p className="text-[#99A1AF] mt-4 text-[20px]">
          Everything you need to know about Lifesaver
        </p>
      </div>

      {/* Main container */}
      <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#4C69BE4D]/50 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-white/10 last:border-none">
            <button
              className="w-full flex justify-between items-center py-5 px-6 text-left hover:bg-white/5 transition-colors rounded-lg"
              onClick={() => toggleFAQ(i)}
            >
              <span className="text-base font-medium pr-4">{faq.question}</span>

              <ChevronDown
                className={`flex-shrink-0 transition-transform duration-300 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
                size={20}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
