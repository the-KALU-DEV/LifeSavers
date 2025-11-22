"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

const faqs = [
  {
    question: "How do I sign up as a donor?",
    answer:
      "Simply send a WhatsApp message to [Our Bot Number] saying 'Hi' or 'I want to donate blood'. Our bot will guide you through a quick registration process where you'll share your blood type and location.",
  },
  {
    question: "How often can I donate?",
    answer:
      "Once every three months is advised as your body needs time to heal after each donation",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes. Your personal details remain private and secure. We never share your phone number or other sensitive data.",
  },
  {
    question: "How does the hospital request process work?",
    answer:
      "Hospitals send a WhatsApp message with the blood type needed, urgency level, and location. Our AI system instantly searches for verified donors nearby and notifies all matching candidates. Hospitals receive donor confirmations within minutes.",
  },
  {
    question: "Can I donate if I have health conditions?",
    answer:
      "Eligibility to donate blood depends on the type and severity of the medical condition. This assessment is done to ensure the safety of both the donor and the recipient.",
  },
  {
    question: "Is there a cost to use Lifesaver?",
    answer:
      "No. Lifesaver is completely free for both donors and hospitals. Our mission is to save lives by connecting those who need blood with those who can help.",
  },
  {
    question: "How are donors verified?",
    answer:
      "All donors go through a pre-screening process during registration. We collect essential health information and verify contact details. Hospitals also conduct their standard screening before accepting any donation.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div
      id="faq"
      className="w-full bg-black text-white py-[60px] lg:py-20 px-4 lg:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-[32px] lg:text-[52px]">
            Frequently Asked Questions
          </h2>
          <p className="text-[#99A1AF] mt-4 text-[16px] lg:text-[20px] px-4">
            Everything you need to know about Lifesaver
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#4C69BE4D]/50 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: index * 0.5 }}
            viewport={{ once: true, amount: 0.3 }}
            className="border-b border-white/10 last:border-none"
          >
            <div>
              <button
                className="w-full flex justify-between items-center py-4 lg:py-5 px-4 lg:px-6 text-left hover:bg-white/5 transition-colors rounded-lg"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-sm lg:text-base font-medium pr-4">
                  {faq.question}
                </span>

                <ChevronDown
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  size={20}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 lg:px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
