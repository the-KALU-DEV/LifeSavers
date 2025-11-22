import CalltoAction from '@/component/CallToAction'
import DonorSection from '@/component/DonorSection'
import FAQSection from '@/component/FAQ'
import HeroSection from '@/component/HeroSection'
import HospitalSection from '@/component/HospitalSection'
import TestimonialSection from '@/component/TestimonialSection'
import WhyUs from '@/component/WhyUs'
import React from 'react'

const page = () => {
  return (
    <div className='text-white'>
      <HeroSection />
      <DonorSection />
      <TestimonialSection />
      <HospitalSection />
      <WhyUs />
      <FAQSection />
      <CalltoAction />
    </div>
  )
}

export default page
