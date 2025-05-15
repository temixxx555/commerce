import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Footer = () => {
  return (
    <footer>
      <div className='flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-500'>
        <div className='w-4/5'>
          <div
            className='cursor-pointer text-Bold'
            onClick={() => router.push("/")}
          >
            <p className='font-bold text-orange-500 '>
              J3 Party <span className='text-black font-normal'>Rentals</span>{" "}
            </p>
          </div>
          <p className='mt-6 text-sm'>
            J3 Party Rentals Your Event Rental Expert 6477121057
            bernardinho4sure@gmail.com Oshawa, ON, Canada
          </p>
        </div>

        <div className='w-1/2 flex items-center justify-start md:justify-center'>
          <div>
            <h2 className='font-medium text-gray-900 mb-5'>Company</h2>
            <ul className='text-sm space-y-2'>
              <li>
                <a className='hover:underline transition' href='/'>
                  Home
                </a>
              </li>
              <li>
                <a className='hover:underline transition' href='/services'>
                  About us
                </a>
              </li>
              <li>
                <a className='hover:underline transition' href='/contact'>
                  Contact us
                </a>
              </li>
              <li>
                <a className='hover:underline transition' href='/privacy'>
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='w-1/2 flex items-start justify-start md:justify-center'>
          <div>
            <h2 className='font-medium text-gray-900 mb-5'>Get in touch</h2>
            <div className='text-sm space-y-2'>
              <p>+1 6477121057</p>
              <p>bernardinho4sure@gmail.com </p>
            </div>
          </div>
        </div>
      </div>
      <p className='py-4 text-center text-xs md:text-sm'>
        Copyright 2025 © temi.dev All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
