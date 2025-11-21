import Image from "next/image";

const cards = [
  {
    icon: "/images/home.png",
    title: "Help Your Neighbors",
    text: "We only match you with people in your area. You might save someone on your street.",
    tag: "Average 2.5km distance",
  },
  {
    icon: "/images/clock.png",
    title: "On Your Schedule",
    text: "Only get notified when it works for you. Say no anytime. Zero pressure.",
    tag: "You're always in control",
  },
  {
    icon: "/images/shield.png",
    title: "Safe & Private",
    text: "Your personal info stays private. Hospitals only see what they need.",
    tag: "Trusted and safe",
  },
  {
    icon: "/images/fully-vetted.png",
    title: "Fully Vetted",
    text: "All donors go through pre-screening. Hospitals verify before accepting any donation.",
    tag: "Safety first, always",
  },
];

const WhyUs = () => {
  return (
    <div id="why-us" className="bg-black py-20 px-6 text-white">
      {/* Heading */}
      <div className="text-center mb-[80px]">
        <h2 className="text-[52px]">
          Why People Trust <span className="text-red-600">LifeSaver</span>
        </h2>
        <p className="text-[#99A1AF] mt-2 text-[20px]">
          Designed for real people, not tech experts
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {cards.map((item) => (
          <div
            key={item.title}
            className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
          >
            <div className="flex justify-center items-center h-[56px] w-[56px] bg-linear-0 from-[#59168B4D] to-[#4C69BE4D] rounded-xl mb-4">
              <Image src={item.icon} alt={item.title} width={30} height={30} />
            </div>

            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

            <p className="text-gray-400 text-sm mb-4">{item.text}</p>

            <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-gray-300">
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyUs;
