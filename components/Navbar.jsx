"use client";
import React, { useState } from "react";
import {
  assets,
  BagIcon,
  BlogIcon,
  BoxIcon,
  CartIcon,
  HomeIcon,
  ServicesIcon,
} from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user } = useAppContext();
  const { openSignIn } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleNavbar = () => {
    setMobileOpen((prev) => !prev);
  };
  const menuLinks = [
    { label: "Home", href: "/", icon: <HomeIcon className="w-4 h-4" /> },
    { label: "Shop", href: "/all-products", icon: <BoxIcon className="w-4 h-4" /> },
    { label: "Services", href: "/services", icon: <ServicesIcon className="w-4 h-4" /> },
    { label: "Blog", href: "/blog", icon: <BlogIcon className="w-4 h-4" /> },
    { label: "Contact Us", href: "/contact", icon: null },
  ];
  return (
    <nav className='flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700'>
      <div
        className='cursor-pointer w-33 md:w-32 text-Bold'
        onClick={() => router.push("/")}
      >
        <p className='font-bold text-orange-500 '>
          J3 Party <span className='text-black font-normal'>Rentals</span>{" "}
        </p>
      </div>
      <div className='flex items-center gap-4 lg:gap-8 max-md:hidden'>
        <Link href='/' className='hover:text-gray-900 transition'>
          Home
        </Link>
        <Link href='/all-products' className='hover:text-gray-900 transition'>
          Shop
        </Link>
        <Link href='/services' className='hover:text-gray-900 transition'>
          Services
        </Link>
        <Link href='/blog' className='hover:text-gray-900 transition'>
          Blog
        </Link>
        <Link href='/contact' className='hover:text-gray-900 transition'>
          Contact Us
        </Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className='text-xs border px-4 py-1.5 rounded-full'
          >
            Seller Dashboard
          </button>
        )}
      </div>

      <ul className='hidden md:flex items-center gap-4 '>
        {user ? (
          <>
            {" "}
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label='cart'
                  labelIcon={<CartIcon />}
                  onClick={() => router.push("/cart")}
                />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action
                  label='My Orders'
                  labelIcon={<BagIcon />}
                  onClick={() => router.push("/my-orders")}
                />
              </UserButton.MenuItems>
            </UserButton>{" "}
          </>
        ) : (
          <button
            onClick={openSignIn}
            className='flex items-center gap-2 hover:text-gray-900 transition'
          >
            <Image src={assets.user_icon} alt='user icon' />
            Account
          </button>
        )}
      </ul>

       {/* Mobile Toggle */}
       <div className="flex items-center md:hidden gap-3">
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border border-orange-500 text-orange-500 px-3 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition"
          >
            Seller Dashboard
          </button>
        )}
        <button
          onClick={toggleNavbar}
          className="text-gray-700 focus:outline-none"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-white flex flex-col p-6 md:hidden">
          <button
            onClick={toggleNavbar}
            className="absolute top-4 right-4 text-gray-700 text-2xl focus:outline-none"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center gap-6 mt-12">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={toggleNavbar}
                className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-orange-500 transition"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="flex flex-col items-center gap-4">
                <Link
                  href="/cart"
                  onClick={toggleNavbar}
                  className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-orange-500 transition"
                >
                  <CartIcon className="w-4 h-4" />
                  Cart
                </Link>
                <Link
                  href="/my-orders"
                  onClick={toggleNavbar}
                  className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-orange-500 transition"
                >
                  <BagIcon className="w-4 h-4" />
                  My Orders
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <button
                onClick={() => {
                  openSignIn();
                  toggleNavbar();
                }}
                className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-orange-500 transition"
              >
                <Image className="w-4 h-4" src={assets.user_icon} alt="user icon" />
                Account
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;