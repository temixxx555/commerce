"use client";
import React from "react";
import { assets, BagIcon, BlogIcon, BoxIcon, CartIcon, HomeIcon, ServicesIcon } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user } = useAppContext();
  const { openSignIn } = useClerk();

  return (
    <nav className='flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700'>
      <div  className='cursor-pointer w-33 md:w-32 text-Bold'
        onClick={() => router.push("/")}>
     
      <p className="font-bold text-orange-500 ">J3 Party <span className="text-black font-normal">Rentals</span> </p>
      </div>
      <div className='flex items-center gap-4 lg:gap-8 max-md:hidden'>
        <Link href='/' className='hover:text-gray-900 transition'>
          Home
        </Link>
        <Link href='/all-products' className='hover:text-gray-900 transition'>
          Shop
        </Link>
        <Link href='/' className='hover:text-gray-900 transition'>
          Services
        </Link>
        <Link href='/' className='hover:text-gray-900 transition'>
        Blog
        </Link>
        <Link href='/' className='hover:text-gray-900 transition'>
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
        <Image className='w-4 h-4' src={assets.search_icon} alt='search icon' />
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

      <div className='flex items-center md:hidden gap-3'>
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className='text-xs border px-4 py-1.5 rounded-full'
          >
            Seller Dashboard
          </button>
        )}
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
              <UserButton.MenuItems>
                <UserButton.Action
                  label='Blog'
                  labelIcon={<BlogIcon />}
                  onClick={() => router.push("/")}
                />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action
                  label='Services'
                  labelIcon={<ServicesIcon />}
                  onClick={() => router.push("/")}
                />
              </UserButton.MenuItems>
              <UserButton.MenuItems>
                <UserButton.Action
                  label='Products'
                  labelIcon={<BoxIcon />}
                  onClick={() => router.push("/all-products")}
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
      </div>
    </nav>
  );
};

export default Navbar;
