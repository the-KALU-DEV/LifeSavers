import Image from "next/image";
import Link from "next/link";
import React from "react";

const NavBar = () => {
  return (
    <div className="w-full text-white px-[39px] py-[19px] backdrop-blur-md bg-black/30 sticky top-0 z-50">
      {/*  */}
      <div className="flex justify-between">
        {/* logo */}
        <div className="flex items-center gap-[8px]">
          <Image
            src="/images/logo.png"
            alt="logo-icon"
            width={24}
            height={24}
          />
          <p>LifeSaver</p>
        </div>

        <div className="flex items-center gap-[32px]">
          {/* links */}
          <div className="flex gap-[32px] text-[14px]">
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#why-us">Why Us</Link>
            <Link href="#faq">FAQ</Link>
            <Link href="#contact">Contact</Link>
          </div>

          <button className="capitalize bg-linear-10 from-[#E7000B] to-[#C10007] rounded-full px-[24px] py-2">
            start helping
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
