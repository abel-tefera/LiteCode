import React from "react";
import samplePic from "../../assets/sample.png";
import logo from "../../assets/logo.png";

const SmallScreenDisclaimer: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start">
      <img
        src={logo}
        alt="Logo"
        className="w-[7rem] select-none border-transparent self-start mx-2 mt-6 mb-2"
      />
      <div className="px-2 max-w-sm bg-transparent rounded-lg shadow flex flex-col items-start my-4">
        <div>
          <img
            className="rounded-t-lg"
            src={samplePic}
            alt="LiteCode on Desktop"
          />
        </div>
        <div className="py-3">
          <div>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-slate-50">
              LiteCode is currently not available on mobile or tablet browsers
            </h5>
          </div>
          <p className="mb-3 font-normal text-slate-100">
            LiteCode is an IDE, and hence, I&apos;ve used my limited resources
            to make it a dedicated desktop enviornment for development. Come
            back later when you&apos;re on your laptop!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmallScreenDisclaimer;
