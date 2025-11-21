import Image from "next/image";
import React from "react";

const stats = [
  {
    image: "/images/fully-vetted.png",
    title: "fully vetted",
    description: "All donors pre-screened for safety",
  },
  {
    image: "/images/time.png",
    title: "12mins",
    description: "Average time to find a donor",
  },
  {
    image: "/images/care.png",
    title: "ongoing care",
    description: "Post-donation health check reminders",
  },
];

const HeroSection = () => {
  return (
    <div className="relative w-full px-[39px] pt-[63px] pb-[160px]">
      {/* bg image */}

      <div>
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          width={100}
          height={100}
          className="absolute top-0 bottom-0 bg-center bg-cover right-0 left-0 w-full h-full"
        />
      </div>

      {/* overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-center bg-cover bg-black/70"></div>

      <div className="flex justify-between items-center relative z-10 ">
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2 bg-linear-0 from-[#E7000B1A] to-[#F549001A] w-[311px] text-[#FFA2A2] text-[14px] p-3 rounded-full border">
            <div className="bg-[#FB2C36] rounded-full h-2 w-2"></div>
            <p>Someone needs blood every 2 seconds</p>
          </div>

          <div>
            <h3 className="capitalize text-[64px] w-[480px] leading-[120%]">
              you could save{" "}
              <span
                className="
            text-[#FB2C36]"
              >
                a life today
              </span>
            </h3>
          </div>

          <p className="w-[470px] text-[20px] text-[#99A1AF]">
            A mother in labor. A child with cancer. An accident victim. They
            &apos;re all waiting for someone like you. Connect instantly via
            WhatsApp.
          </p>

          <div className="capitalize flex justify-center items-center gap-3 bg-gradient-to-r from-[#E7000B] to-[#C10007] w-[291px] rounded-full py-3 mt-5">
            <Image src="/images/messaging.png" alt="" width={24} height={24} />
            <p>start helping on WhatsApp</p>
          </div>

          <p className="text-[#6A7282] text-[14px]">
            No app needed. Works on the WhatsApp you already use.
          </p>
        </section>

        {/*  */}

        {/* second section */}
        <section className="flex flex-col gap-5">
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border border-gray-500 rounded-xl w-[472px] p-5 backdrop-blur-md"
            >
              <div
                className="flex justify-center items-center rounded-xl w-[56px] h-[56px]"
                style={{
                  backgroundColor:
                    item.title === "fully vetted"
                      ? "#00A63E33"
                      : item.title === "12mins"
                      ? "#193CB833"
                      : "#9F071233",
                }}
              >
                <Image
                  src={item.image}
                  alt="stats-icon"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h4 className="capitalize text-[#99A1AF] text-[18px]">
                  {item.title}
                </h4>
                <p className="text-[#99A1AF] text-[14px]">{item.description}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default HeroSection;
