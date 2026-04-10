import React from "react";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <img
        src={assets.bgImage}
        alt=""
        className="absolute top-0 left-0 -z-1 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-white/70"></div>

      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40 relative z-10">
        <img src={assets.logo} alt="" className="h-12 object-contain" />

        <div>
          <div className="flex items-center gap-3 mb-4 max-md:mt-10">
            <img src={assets.group_users} alt="" className="h-8 md:h-10" />
            <div>
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 md:size-5 text-transparent fill-amber-500"
                    />
                  ))}
              </div>
              <p className="text-sm">Used by 12k+ developers</p>
            </div>
          </div>

          <h1 className="text-3xl md:text-6xl font-bold">
            More than just friends <br />
            <span className="bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">
              truly connect
            </span>
          </h1>

          <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md mt-2">
            connect with global community on pingup.
          </p>
        </div>

        <span className="md:h-10"></span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <SignIn />
      </div>
    </div>
  );
};

export default Login;
