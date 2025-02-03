import { vividlyLogoLight, vividlyLogoDark } from "@/assets"
import { useTheme } from "@/components"
import ThemeToggle from "@/components/ThemeToggle"
import { themes } from "@/constant"
import { Link, useLocation } from "react-router-dom"

function Authlayout({ children, onLightPoster, onDarkPoster }) {
  const { theme } = useTheme()
  const location = useLocation()

  const isPageLengthy = ["/sign-up"].includes(location.pathname)
  const ThemeToggleClass = isPageLengthy ? "mt-10 lg:mt-0 sm:absolute sm:bottom-10 sm:left-8" : "absolute bottom-10 left-8"
  const isDarkTheme = theme === themes[0]


  return (
    <div className="flex min-h-screen flex-col lg:flex-row dark:bg-[#131619]">

      {/* Left Section */}
      <div className="relative flex-1 w-full lg:w-[45%] p-8 lg:p-12">
        {/* Logo */}
        <div className="mb-10 lg:mb-0 lg:absolute lg:top-0 lg:left-8">
          <div className="flex items-center gap-2">
            <Link to="/">
              <img
                src={isDarkTheme ? vividlyLogoDark : vividlyLogoLight}
                className="w-32 h-32 "
                alt="Vividly AI Logo"
              />
            </Link>
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
  )
}

export default Authlayout