import React from 'react'
import { Button } from './ui/button'
import { useTheme } from './index'
import { moonIcon, sunIcon } from '@/assets'
import { themes } from '@/constant'

const ThemeToggle = () => {

  const { theme, setTheme } = useTheme()
  const isDarkTheme = theme === themes[0]

  return (
    <div className="flex gap-2">
      <Button
        size="md"
        variant={isDarkTheme ? "default" : "secondary"}
        onClick={() => setTheme("dark")}
        className="text-xs"
        icon={<img src={moonIcon}
          alt="Moon Icon"
          className="w-5 h-5"
        />}
      >
        Dark Mode
      </Button>
      <Button
        variant={isDarkTheme ? "secondary" : "default"}
        size="md"
        onClick={() => setTheme("light")}
        className="text-xs"
        icon={<img src={sunIcon} alt="Moon Icon"
          className="w-5 h-5"
        />}
      >
        Light Mode
      </Button>
    </div>
  )
}

export default ThemeToggle