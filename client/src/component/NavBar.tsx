'use client'

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// NAVBAR COMPONENT
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // prevent background scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);


  return (
    <div className="w-full text-white px-4 lg:px-[39px] py-[19px] backdrop-blur-md bg-black/30 fixed top-0 z-50">
      <div className="flex justify-between w-full lg:w-[992px] mx-auto items-center">
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

        {/* Hamburger Icon */}
        <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-[32px]">
          <div className="flex gap-[32px] text-[14px]">
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#why-us">Why Us</Link>
            <Link href="#faq">FAQ</Link>
          </div>

          <button className="capitalize bg-gradient-to-r from-[#E7000B] to-[#C10007] rounded-full px-[24px] py-2">
            start helping
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed top-full left-0 w-full h-[100vh] bg-black/95 border-t border-white/10 py-4">
          <div className="flex flex-col justify-center items-center h-full gap-10 px-4">
            <Link href="#how-it-works" onClick={() => setIsOpen(false)}>
              How It Works
            </Link>
            <Link href="#why-us" onClick={() => setIsOpen(false)}>
              Why Us
            </Link>
            <Link href="#faq" onClick={() => setIsOpen(false)}>
              FAQ
            </Link>
            <button className="capitalize bg-gradient-to-r from-[#E7000B] to-[#C10007] rounded-full px-[24px] py-2 w-full">
              start helping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar