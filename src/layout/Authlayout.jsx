import { vividlyLogoLight, vividlyLogoDark} from "@/assets"
import { useTheme } from "@/components"
import ThemeToggle from "@/components/ThemeToggle"

function Authlayout({ children, onLightPoster, onDarkPoster }) {
  const { theme} = useTheme()

  return (
    <div className="flex min-h-screen flex-col lg:flex-row dark:bg-[#131619]">

      {/* Left Section */}
      <div className="relative flex-1 w-full lg:w-[45%] p-8 lg:p-12">
        {/* Logo */}
        <div className="mb-16 lg:mb-0 lg:absolute lg:top-0 lg:left-8">
          <div className="flex items-center gap-2">
            <img
              src={theme === "dark" ? vividlyLogoDark : vividlyLogoLight}
              className="w-32 h-32 lg:w-40 lg:h-40"
              alt="Vividly AI Logo"
            />
          </div>
        </div>


        {/* Auth Content */}
        <div className="mx-auto max-w-md h-full flex items-center">
        {children}
        </div>


        {/* Theme Toggle */}
        <div className="absolute bottom-8 left-8 mt-0">
          <ThemeToggle />
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden lg:block w-full lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 ">
          <img
            src={theme === "dark" ? onDarkPoster : onLightPoster}
            alt="Login Security Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default Authlayout