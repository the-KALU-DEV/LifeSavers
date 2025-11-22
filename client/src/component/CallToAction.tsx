"use client";

import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";

const CalltoAction = () => {
  return (
    <div className="flex flex-col items-center bg-black text-white px-4 lg:px-[88px] bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.03),rgba(0,0,0,1)),linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,1))]">
      <section className="flex flex-col items-center justify-center gap-[20px] lg:gap-[23px] px-4 lg:px-6 py-[60px] lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-[32px] lg:text-[52px] text-center leading-tight">
              Someone Is Waiting{" "}
              <span className="text-red-600">Right Now!</span>
            </h1>
            <p className="text-[#99A1AF] text-center w-full lg:w-[615px] text-[16px] lg:text-[20px]">
              It takes 2 minutes to sign up. It takes your blood to save a life.
              Start on WhatsApp today.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <button className="bg-red-600 hover:bg-red-700 transition-colors px-6 lg:px-8 py-3 lg:py-4 rounded-full flex items-center gap-3 text-base lg:text-lg font-medium">
            <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
            I&apos;m Ready to Help
            <span className="ml-1">→</span>
          </button>
        </motion.div>
      </section>

      <section className="flex flex-col items-center justify-center px-4 lg:px-6 py-[60px] lg:py-20 border-t border-t-white/10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-col">
            <h2 className="text-[24px] lg:text-[30px] text-center mb-[16px]">
              Are You a Hospital or Blood Bank?
            </h2>
            <p className="text-[#99A1AF] text-center text-[14px] lg:text-[16px] w-full lg:w-[542px] mb-12">
              Get instant access to verified donors when you need them most. Our
              WhatsApp-based system connects you with compatible donors in
              minutes, 24/7.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center gap-4 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Image
                src="/images/check.png"
                alt="a check icon"
                width={24}
                height={24}
              />
              <span className="text-[#99A1AF]">Trusted and Safe</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Image
                src="/images/check.png"
                alt="a check icon"
                width={24}
                height={24}
              />
              <span className="text-[#99A1AF]">Privacy Protected</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.7 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Image
                src="/images/check.png"
                alt="a check icon"
                width={24}
                height={24}
              />
              <span className="text-[#99A1AF]">Verified Donors</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CalltoAction;
