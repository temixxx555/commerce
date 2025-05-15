"use client";
import Head from "next/head";
import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar"; // Adjust path to your Navbar component
import Footer from "@/components/Footer"; // Adjust path to your Footer component
import { useAppContext } from "@/context/AppContext";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = {
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      email: e.target.email.value,
      message: e.target.message.value,
      number: e.target.number.value,
    };
    console.log(formData);

    try {
      const token = await getToken();

      const response = await fetch("/api/detail/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          "Your message has been sent! We'll get back to you soon."
        );
        e.target.reset();
      } else {
        toast.error(
          data.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | J3 Party Rentals</title>
        <meta
          name='description'
          content='Get in touch with J3 Party Rentals for quotes, inquiries, or support. Fill out our contact form or reach us via phone, email, or social media.'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />
      <main className='min-h-screen bg-white'>
        {/* Header Section */}
        <section className='bg-[E6E9F2] py-16 text-center'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4'>
              Contact J3 Party Rentals
            </h1>
            <p className='text-lg md:text-xl text-gray-600'>
              Have questions or need a quote for your event? We're here to help!
              Reach out via our form, phone, or email.
            </p>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className='py-12 bg-white'>
          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-6'>
                Get in Touch
              </h2>
              <ul className='space-y-4 text-gray-600'>
                <li className='flex items-center'>
                  <svg
                    className='w-6 h-6 text-orange-400 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                  <a
                    href='mailto:support@j3partyrentals.com'
                    className='hover:text-orange-400'
                  >
                    bernardinho4sure@gmail.com
                  </a>
                </li>
                <li className='flex items-center'>
                  <svg
                    className='w-6 h-6 text-orange-400 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                  <a href='tel:+1234567890' className='hover:text-orange-400'>
                    +1 6477121057
                  </a>
                </li>
                <li className='flex items-center'>
                  <svg
                    className='w-6 h-6 text-orange-400 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  <span>Chandos crt, Oshawa, Ontario, Canada</span>
                </li>
              </ul>
              <div className='mt-6'>
                <h3 className='text-lg font-medium text-gray-800 mb-3'>
                  Follow Us
                </h3>
                <div className='flex space-x-4'>
                  <a
                    href='https://www.facebook.com/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-orange-400'
                  >
                    <svg
                      className='w-6 h-6'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-2v4h-3v-4h-2v-2h2V9c0-1.66 1.34-3 3-3h2v2h-2c-.55 0-1 .45-1 1v2h3v2z' />
                    </svg>
                  </a>
                  <a
                    href='https://instagram.com/j3partyrentals'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-pink-600 hover:text-orange-400'
                  >
                    <svg
                      className='w-6 h-6'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 7h-2.93c.52-.79.93-1.72.93-2.75 0-.69-.56-1.25-1.25-1.25h-1.5v6h1.5c.69 0 1.25-.56 1.25-1.25 0-.97-.52-1.79-1.25-2.25.73-.46 1.25-1.28 1.25-2.25zm-5 0h-1.5v6h1.5c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25z' />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className='bg-gray-100 p-6 rounded-lg'>
              <h3 className='text-xl font-medium text-gray-800 mb-4'>
                Business Hours
              </h3>
              <p className='text-gray-600'>
                Monday - Friday: 8:00 am – 8:00 pm
                <br />
                Saturday: 9:00 AM - 7:00 PM
                <br />
                Sunday: 10:00 am – 7:00 pm
              </p>
            </div>
          </div>
        </section>

        {/* Get a Quote Form Section */}
        <section
          className='py-12 bg-gray-50'
          aria-label='Contact J3 Party Rentals'
        >
          <div className='px-4 mx-auto max-w-3xl sm:px-6 lg:px-8'>
            <h2 className='mb-8 text-3xl font-bold text-center text-gray-800 md:text-4xl'>
              Get a Quote
            </h2>
            <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
              <div className='flex flex-col gap-2 sm:flex-row sm:gap-4'>
                <div className='flex flex-col w-full'>
                  <label
                    htmlFor='firstName'
                    className='text-sm font-medium text-gray-700'
                  >
                    First Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    required
                    placeholder='Enter your first name'
                    className='w-full px-4 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400'
                  />
                </div>
                <div className='flex flex-col w-full'>
                  <label
                    htmlFor='lastName'
                    className='text-sm font-medium text-gray-700'
                  >
                    Last Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    required
                    placeholder='Enter your last name'
                    className='w-full px-4 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400'
                  />
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  required
                  placeholder='Enter your email'
                  className='w-full px-4 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='number'
                  className='text-sm font-medium text-gray-700'
                >
                  Phone Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='number'
                  name='number'
                  required
                  placeholder='Enter your Phone Number'
                  className='w-full px-4 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='message'
                  className='text-sm font-medium text-gray-700'
                >
                  Event Details
                </label>
                <textarea
                  id='message'
                  name='message'
                  rows={4}
                  placeholder='Tell us about your event (e.g., date, location, rental needs)'
                  className='w-full px-4 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400'
                />
              </div>
              <button
                type='submit'
                disabled={isSubmitting}
                className={`px-6 py-3 mt-4 text-white bg-orange-400 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </section>

        {/* Optional Map Section (Uncomment to Enable) */}

        <section className='py-12'>
          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center'>
              Find Us
            </h2>
            <div className='aspect-w-16 aspect-h-9'>
              <iframe
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2876.4379457794926!2d-78.85563932532003!3d43.86747703854787!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d51d44301b3ef9%3A0x4e13b2ce1dcf76f7!2sChandos%20Ct%2C%20Oshawa%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sng!4v1747320575310!5m2!1sen!2sng"
                width='100%'
                height='450'
                style={{ border: 0 }}
                allowFullScreen=''
                loading='lazy'
                title='J3 Party Rentals Location'
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
