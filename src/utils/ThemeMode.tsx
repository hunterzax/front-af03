"use client"
import React from 'react'
import { useTheme } from "next-themes";


function ThemeMode() {
  const { systemTheme, theme, setTheme } = useTheme();

  function onSelectChangeTogle() {
    // theme === "dark" ? setTheme("light") : setTheme("dark");
    // theme === "dark" ? setTheme("light") : setTheme("light");
    setTheme("light")
  }

  return (
    <div className=' cursor-pointer' onClick={()=>{onSelectChangeTogle()}}>Switch Theme</div>
  )
}

export default ThemeMode