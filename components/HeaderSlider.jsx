"use client";
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "J3 party Rentals  Your one-stop party shop",
      offer: "",
      buttonText1: "Book now",
      buttonText2: "Find more",
      imgSrc: assets.party,
    },
    {
      id: 2,
      title: "J3 party Rentals  Your one-stop party shop,Come lets host your events",
      offer: "",
      buttonText1: "Book now",
      buttonText2: "Find more",
      imgSrc: assets.outdoor,
    },
    {
      id: 3,
      title: "J3 party Rentals  Your one-stop party shop,Come lets host your events",
      offer: "",
      buttonText1: "Book now",
      buttonText2: "Find more",
      imgSrc: assets.outdoor2,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
          key={slide.id}
          className="flex flex-col-reverse md:flex-row items-center justify-between py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full h-[400px] bg-cover bg-center opacity-190"
          style={{
            backgroundImage: `url(${slide.imgSrc.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] text-white/90 md:leading-[48px] text-xl md:text-2xl font-normal md:font-bold">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 ">
              <Link href="/contact">
                <button className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium">
                  {slide.buttonText1}
                </button>
                </Link>
                <Link href="/services">
                <button className="group flex items-center text-white gap-2 px-6 py-2.5 font-medium">
                  {slide.buttonText2}
                  <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon} alt="arrow_icon" />
                </button>
                </Link>
             
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
