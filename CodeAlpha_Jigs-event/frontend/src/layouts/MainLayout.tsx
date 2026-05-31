import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AnimatedBackground from '../components/AnimatedBackground'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      {/* Sticky Navbar */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <div className="relative z-10 w-full">
        <Footer />
      </div>
    </div>
  )
}

export default MainLayout
