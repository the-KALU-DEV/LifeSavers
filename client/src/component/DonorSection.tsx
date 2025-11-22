"use client";
import { motion } from "motion/react";

const donorFlow = [
  {
    stage: 1,
    title: "say hi on whatsApp",
    message: "Just send a message like you would to a friend",
  },
  {
    stage: 2,
    title: "share your info",
    message: "Tell us your blood type and where you live",
  },
  {
    stage: 3,
    title: "we'll reach out",
    message: "Get a message only when someone nearby needs your blood type",
  },
  {
    stage: 4,
    title: "you decide",
    message: "Say yes if you can donate. No pressure, ever.",
  },
];

const DonorSection = () => {
  return (
    <div
      id="how-it-works"
      className="flex flex-col justify-center items-center gap-[40px] lg:gap-[80px] px-4 lg:px-[39px] py-[60px] lg:py-[80px] w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex flex-col justify-center items-center">
          <h3 className="text-[32px] lg:text-[52px] capitalize text-center">
            Simple as sending a text
          </h3>
          <p className="text-[16px] lg:text-[20px] text-[#99A1AF] w-full lg:w-[610px] text-center px-4">
            Everything happens right in WhatsApp. No downloads, no complicated
            forms.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[24px] w-full max-w-[1000px]">
        {donorFlow.map((item, id) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: id * 0.5 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex flex-col gap-3 h-auto lg:h-[220px] w-full lg:w-[230px] rounded-xl bg-gradient-to-r from-white/5 to-black border border-gray-800 p-5">
              <div className="flex justify-center items-center w-[40px] h-[40px] rounded-full bg-gradient-to-r from-[#E7000B4D] to-[#155DFC4D]">
                {item.stage}
              </div>

              <h3 className="text-[16px] lg:text-[18px] capitalize">
                {item.title}
              </h3>

              <p className="text-[14px] text-[#99A1AF] w-full lg:w-[166px]">
                {item.message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DonorSection;
