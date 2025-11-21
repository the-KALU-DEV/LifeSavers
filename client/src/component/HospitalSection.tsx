import React from 'react'

const hospitalFlow = [
  {
    stage: 1,
    title: "send emergency request",
    message: "Message us with blood type needed and urgency level",
  },
  {
    stage: 2,
    title: "AI finds matches",
    message: "Our system instantly searches verified donors nearby",
  },
  {
    stage: 3,
    title: "donors notified",
    message: "We reach out to all matching donors in your area",
  },
  {
    stage: 4,
    title: "match confirmed",
    message: "Get donor details and coordinate the donation.",
  },
];

const HospitalSection = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-[80px] px-[39px] py-[80px] w-full ">
      <div className="flex flex-col justify-center items-center">
        <h3 className="text-[52px] capitalize">for hospitals & blood banks</h3>
        <p className="text-[20px] text-[#99A1AF] w-full text-center">
          When every second counts, find verified donors instantly through
          WhatsApp.
        </p>
      </div>

      {/*  */}

      {/* cards */}
      <div className="grid grid-cols-4 gap-[24px]">
        {hospitalFlow.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 h-[220px] w-[230px] rounded-xl bg-gradient-to-r from-white/5 to-black  border border-gray-800 p-5"
          >
            <div className="flex justify-center items-center w-[40px] h-[40px] rounded-full bg-gradient-to-r from-[#E7000B4D] to-[#155DFC4D]">
              {item.stage}
            </div>

            <h3 className="text-[18px] capitalize">{item.title}</h3>

            <p className="text-[14px] text-[#99A1AF] w-[166px]">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HospitalSection
