"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const stats = [
  {
    image: "/images/fully-vetted.png",
    title: "fully vetted",
    description: "All donors pre-screened for safety",
    bg: "#00A63E33",
  },
  {
    image: "/images/time.png",
    title: "12mins",
    description: "Average time to find a donor",
    bg: "#193CB833",
  },
  {
    image: "/images/care.png",
    title: "ongoing care",
    description: "Post-donation health check reminders",
    bg: "#9F071233",
  },
];

const HeroSection = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative px-4 lg:px-[39px] pt-[100px] lg:pt-[128px]">
      <div className="w-full max-w-[1071px] pb-[80px] lg:pb-[160px] mx-auto">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-black/80 z-10"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-0 relative z-10">
          <motion.section
            initial={{
              opacity: 0,
              x: isMobile ? 0 : -100,
              y: isMobile ? 50 : 0,
            }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col gap-5 text-center lg:text-left"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#E7000B1A] to-[#F549001A] w-full lg:w-[311px] text-[#FFA2A2] text-[12px] lg:text-[14px] p-3 rounded-full border mx-auto lg:mx-0">
              <div className="bg-[#FB2C36] rounded-full h-2 w-2"></div>
              <p>Someone needs blood every 2 seconds</p>
            </div>

            <div>
              <h3 className="capitalize text-[36px] lg:text-[64px] w-full lg:w-[480px] leading-[120%]">
                you could save{" "}
                <span className="text-[#FB2C36]">a life today</span>
              </h3>
            </div>

            <p className="w-full lg:w-[470px] text-[16px] lg:text-[20px] text-[#99A1AF]">
              A mother in labor. A child with cancer. An accident victim.
              They&apos;re all waiting for someone like you. Connect instantly
              via WhatsApp.
            </p>

            <div className="capitalize flex justify-center items-center gap-3 bg-gradient-to-r from-[#E7000B] to-[#C10007] w-full lg:w-[291px] rounded-full py-3 mt-5 mx-auto lg:mx-0">
              <Image
                src="/images/messaging.png"
                alt=""
                width={24}
                height={24}
              />
              <p className="text-[14px] lg:text-base">
                start helping on WhatsApp
              </p>
            </div>

            <p className="text-[#6A7282] text-[12px] lg:text-[14px]">
              No app needed. Works on the WhatsApp you already use.
            </p>
          </motion.section>

          <section className="flex flex-col gap-5 w-full lg:w-auto">
            {stats.map((item, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: isMobile ? 0 : 100,
                  y: isMobile ? 50 : 0,
                }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
                viewport={{ once: true, amount: 0.3 }}
                className="flex items-center gap-3 border border-gray-500 rounded-xl w-full lg:w-[472px] p-5 backdrop-blur-md"
              >
                <div
                  className="flex justify-center items-center rounded-xl w-[56px] h-[56px] flex-shrink-0"
                  style={{ backgroundColor: item.bg }}
                >
                  <Image
                    src={item.image}
                    alt="stats-icon"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <h4 className="capitalize text-[#99A1AF] text-[16px] lg:text-[18px]">
                    {item.title}
                  </h4>
                  <p className="text-[#99A1AF] text-[12px] lg:text-[14px]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
