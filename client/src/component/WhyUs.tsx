"use client";

import Image from "next/image";
import { motion } from "motion/react";

const cards = [
  {
    icon: "/images/home.png",
    title: "Help Your Neighbors",
    text: "We only match you with people in your area. You might save someone on your street.",
    tag: "Average 2.5km distance",
  },
  {
    icon: "/images/clock.png",
    title: "On Your Schedule",
    text: "Only get notified when it works for you. Say no anytime. Zero pressure.",
    tag: "You're always in control",
  },
  {
    icon: "/images/shield.png",
    title: "Safe & Private",
    text: "Your personal info stays private. Hospitals only see what they need.",
    tag: "Trusted and safe",
  },
  {
    icon: "/images/fully-vetted.png",
    title: "Fully Vetted",
    text: "All donors go through pre-screening. Hospitals verify before accepting any donation.",
    tag: "Safety first, always",
  },
];

const WhyUs = () => {
  return (
    <div
      id="why-us"
      className="bg-black py-[60px] lg:py-20 px-4 lg:px-6 text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="text-center mb-[60px] lg:mb-[80px]">
          <h2 className="text-[32px] lg:text-[52px]">
            Why People Trust <span className="text-red-600">LifeSaver</span>
          </h2>
          <p className="text-[#99A1AF] mt-2 text-[16px] lg:text-[20px] px-4">
            Designed for real people, not tech experts
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {cards.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: index * 0.5 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
              <div className="flex justify-center items-center h-[56px] w-[56px] bg-gradient-to-r from-[#59168B4D] to-[#4C69BE4D] rounded-xl mb-4">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={30}
                  height={30}
                />
              </div>

              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

              <p className="text-gray-400 text-sm mb-4">{item.text}</p>

              <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-gray-300">
                {item.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhyUs;
