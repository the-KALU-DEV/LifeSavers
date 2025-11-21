import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="px-[39px] py-[40px] border-t border-t-white/10 mt-10 text-[14px]">
      <div className="flex flex-col gap-[32px]">
        <section className="flex justify-between border">
          {/*  */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-[8px] text-white">
              <Image
                src="/images/logo.png"
                alt="logo-icon"
                width={24}
                height={24}
              />
              <p>LifeSaver</p>
            </div>
            <div>
              <p className="text-[#6A7282] w-[280px]">
                Connecting people who need blood with people who can help.
                Simple, fast, and on WhatsApp.
              </p>
            </div>
          </div>
          {/* quick links */}
          <div className="flex flex-col gap-[6px]">
            <h3 className="uppercase text-white">quick links</h3>
            <nav className="flex flex-col text-[#6A7282]">
              <Link href="#how-it-works">how it works</Link>
              <Link href="#why-us">why us</Link>
              <Link href="#hospital">for hospitals</Link>
            </nav>
          </div>
          <div className="flex flex-col gap-[6px]">
            <h3 className="uppercase text-white">get help</h3>
            <div className="text-[#6A7282] flex flex-col gap-[6px]">
              <p>+234 906 140 4988</p>
              <p>help@lifesaver.com</p>
              <p>Enugu, Nigeria</p>
            </div>
          </div>
        </section>
        <section className="flex justify-between text-[#6A7282] border-t border-t-white/10 py-[19px]">
          <p>&copy; 2025 LifeSaver. Every donation saves 3 lives</p>
          <p className="flex items-center gap-2">
            Made with{" "}
            <span>
              <Image
                src="/images/love.png"
                alt="a love emoji"
                width={13}
                height={11}
              />{" "}
            </span>
            for humanity
          </p>
        </section>
      </div>
    </div>
  );
};

export default Footer;
