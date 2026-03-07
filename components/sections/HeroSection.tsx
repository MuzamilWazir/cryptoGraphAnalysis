import React from "react";

const HeroSection = () => {
  return (
    <div className="relative h-screen bg-[url('/bgimage.jpg')] bg-cover bg-center">
      {/* Content goes here */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="bg-clip-text text-transparent bg-linear-to-r  from-white to-orange-400 text-9xl font-roboto-slab font-bold shadow-2xl ">
          Lets Trade With Us
        </h1>
      </div>
    </div>
  );
};

export default HeroSection;
