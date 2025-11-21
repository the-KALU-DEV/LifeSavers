import Image from 'next/image';
import React from 'react'

const TestimonialSection = () => {
  return (
    <div className="flex justify-center w-full pb-[80px]">
      <div className="flex flex-col items-center justify-between px-[89px] py-[49px] bg-linear-0 from-[#9810FA33] to-[#155DFC33] w-[994px] h-[364px] rounded-[24px]">
        {/* image */}
        <div className="rounded-full border-2 w-[64px] h-[64px] overflow-hidden">
          <Image
            src="/images/testimonial-img.jpg"
            alt=""
            width={64}
            height={64}
            className="object-cover"
          />
        </div>

        <h3 className="text-[24px] italic text-[#D1D5DC] font-normal">
          &quot;I got a message while at work. 15 minutes later, I was at the
          hospital. The mother smiled at me through tears. I&apos;ll never
          forget that moment.&quot;
        </h3>

        <div className='text-center'>
            <p className="text-[14px] capitalize text-[#99A1AF]">
              — Chukwuemeka, Regular Donor
            </p>
            <p className="text-[#6A7282] text-[12px]">Donated 8 times via LifeSaver</p>
        </div>
      </div>
    </div>
  );
}

export default TestimonialSection
