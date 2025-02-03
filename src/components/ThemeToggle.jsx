import React from 'react'
import { Button } from './ui/button'
import { useTheme } from './index'
import { moonIcon } from '@/assets'

const ThemeToggle = () => {

  const { setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      <Button
        size="md"
        variant="secondary"
        onClick={() => setTheme("dark")}
        className="text-xs"
        icon={<img src={moonIcon}
          alt="Moon Icon"
          className="w-5 h-5 filter invert"
        />}
      >
        Dark Mode
      </Button>
      <Button
        size="md"
        onClick={() => setTheme("light")}
        className="text-xs text-black"
        icon={<img src={moonIcon} alt="Moon Icon"
          className="w-5 h-5"
        />}
      >
        Light Mode
      </Button>
    </div>
  )
}

export default ThemeToggle