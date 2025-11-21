import { MessageCircle } from "lucide-react";
import Image from "next/image";

const CalltoAction = () => {
  return (
    <div className="min-h-screen bg-black text-white px-[88px]">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-[23px] px-6 py-20 min-h-[60vh]">
        <h1 className="text-[52px] text-center">
          Someone Is Waiting <span className="text-red-600">Right Now!</span>
        </h1>

        <p className="text-[#99A1AF] text-center w-[615px] text-[20px]">
          It takes 2 minutes to sign up. It takes your blood to save a life.
          Start on WhatsApp today.
        </p>

        <button className="bg-red-600 hover:bg-red-700 transition-colors px-8 py-4 rounded-full flex items-center gap-3 text-lg font-medium">
          <MessageCircle className="w-6 h-6" />
          I&apos;m Ready to Help
          <span className="ml-1">→</span>
        </button>
      </section>

      {/* Hospital Section */}
      <section className="flex flex-col items-center justify-center bg-gradient-to-bl from-[#4C69BE4D]/50 px-6 py-20 border-t border-t-white/10">
        <h2 className="text-[30px] text-center mb-[16px]">
          Are You a Hospital or Blood Bank?
        </h2>

        <p className="text-[#99A1AF] text-center text-[16px] w-[542px] mb-12">
          Get instant access to verified donors when you need them most. Our
          WhatsApp-based system connects you with compatible donors in minutes,
          24/7.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Image
              src="/images/check.png"
              alt="a check icon"
              width={24}
              height={24}
            />
            <span className="text-[#99A1AF]">Trusted and Safe</span>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src="/images/check.png"
              alt="a check icon"
              width={24}
              height={24}
            />
            <span className="text-[#99A1AF]">Privacy Protected</span>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src="/images/check.png"
              alt="a check icon"
              width={24}
              height={24}
            />
            <span className="text-[#99A1AF]">Verified Donors</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CalltoAction