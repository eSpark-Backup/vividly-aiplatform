import { vividlyLogoLight, vividlyLogoDark } from "@/assets";
import { useTheme } from "@/components";
import { themes } from "@/constant";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./index";

function AuthLayout({ children, onLightPoster, onDarkPoster }) {
  const { theme } = useTheme();
  const location = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const isDarkTheme = theme === themes[0];

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerHeight < 840);

    window.addEventListener("resize", checkScreenSize);
    checkScreenSize();

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const isPageLengthy = location.pathname === "/sign-up";
  const isLoginPage = location.pathname === "/log-in";

  let ThemeToggleClass = "absolute bottom-12 left-8";

  if (isSmallScreen && isLoginPage) {
    ThemeToggleClass = "relative mt-8";
  } else if (isSmallScreen && isPageLengthy) {
    ThemeToggleClass = "mt-10 lg:mt-0 sm:absolute sm:bottom-10 sm:left-8";
  }

  return (
    <div className={"flex min-h-screen flex-col lg:flex-row"}>
      {/* Left Section */}
      <div className="relative flex-1 w-full lg:w-[45%] p-8 lg:px-10 lg:py-24">
        {/* Logo */}
        <div className="mb-10 lg:mb-0 lg:absolute lg:top-1 lg:left-8">
          <div className="flex items-center gap-2">
            {/* <Link to="/"> */}
            <div>
              <img
                src={isDarkTheme ? vividlyLogoDark : vividlyLogoLight}
                className="w-32 h-32 cursor-pointer"
                alt="Vividly AI Logo"
              />
            </div>
            {/* </Link> */}
          </div>
        </div>

        {/* Auth Content */}
        <div className="mx-auto max-w-md h-full flex items-center">
          {children}
        </div>

        {/* Theme Toggle */}
        <div className={ThemeToggleClass}>
          <ThemeToggle />
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden lg:block w-full lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 ">
          <img
            src={isDarkTheme ? onDarkPoster : onLightPoster}
            alt="Login Security Illustration"
            className="w-full h-full object-cover rounded-l-[40px]"
          />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
