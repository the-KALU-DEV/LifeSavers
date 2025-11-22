'use client'

import Image from "next/image";
import { motion } from "motion/react";

const TestimonialSection = () => {
  return (
    <div className="flex justify-center w-full pb-[60px] lg:pb-[80px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex flex-col items-center justify-between px-6 lg:px-[89px] py-[40px] lg:py-[49px] bg-gradient-to-r from-[#9810FA33] to-[#155DFC33] w-full lg:w-[994px] h-auto lg:h-[364px] rounded-[24px] gap-6">
          <div className="rounded-full border-2 w-[64px] h-[64px] overflow-hidden">
            <Image
              src="/images/testimonial-img.jpg"
              alt=""
              width={64}
              height={64}
              className="object-cover"
            />
          </div>

          <h3 className="text-[18px] lg:text-[24px] italic text-[#D1D5DC] font-normal text-center">
            &quot;I got a message while at work. 15 minutes later, I was at the
            hospital. The mother smiled at me through tears. I&apos;ll never
            forget that moment.&quot;
          </h3>

          <div className="text-center">
            <p className="text-[14px] capitalize text-[#99A1AF]">
              — Chukwuemeka, Regular Donor
            </p>
            <p className="text-[#6A7282] text-[12px]">
              Donated 8 times via LifeSaver
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TestimonialSection;
