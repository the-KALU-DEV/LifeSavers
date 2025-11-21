import React from 'react'

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
    <div className="flex flex-col justify-center items-center gap-[80px] px-[39px] py-[80px] w-full ">
      <div className="flex flex-col justify-center items-center">
        <h3 className="text-[52px] capitalize">Simple as sending a text</h3>
        <p className="text-[20px] text-[#99A1AF] w-[610px] text-center">
          Everything happens right in WhatsApp. No downloads, no complicated
          forms.
        </p>
      </div>

      {/*  */}

      {/* cards */}
      <div className="grid grid-cols-4 gap-[24px]">
        {donorFlow.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 h-[220px] w-[230px] rounded-xl bg-gradient-to-r from-white/5 to-black  border border-gray-800 p-5"
          >
            <div className="flex justify-center items-center w-[40px] h-[40px] rounded-full bg-gradient-to-r from-[#E7000B4D] to-[#155DFC4D]">
              {item.stage}
            </div>

            <h3 className="text-[18px] capitalize">{item.title}</h3>

            <p className="text-[14px] text-[#99A1AF] w-[166px]">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonorSection
