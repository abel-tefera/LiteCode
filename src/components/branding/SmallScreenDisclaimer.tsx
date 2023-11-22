import React from "react";
import samplePic from "../../assets/sample.png";
import logo from "../../assets/logo.png";

const SmallScreenDisclaimer = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <img
        src={logo}
        alt="Logo"
        className="w-[7rem] select-none border-transparent self-start mb-4 mx-2"
      />
      <div className="px-2 max-w-sm bg-transparent rounded-lg shadow flex flex-col items-start">
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
              LiteCode is not available on mobile browsers
            </h5>
          </div>
          <p className="mb-3 font-normal text-slate-100">
            LiteCode is an IDE, and hence, I've used my limited resources to
            make it a dedecited desktop enviornment for developers. Come back
            later when you're on your laptop!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmallScreenDisclaimer;
