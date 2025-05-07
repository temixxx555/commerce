"use client";
import Navbar from "@/components/Navbar";
import pic from "../../assets/table.jpg";
import house from "../../assets/house.jpg";
import plates from "../../assets/plates.jpg";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
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
    <div className='flex flex-col w-full'>
      <Navbar />
      <section
        className='relative flex flex-col items-center justify-center h-screen bg-no-repeat bg-cover bg-center'
        style={{ backgroundImage: `url(/pic.png)` }}
        aria-label='J3 Party Rentals Services'
      >
        {/* Overlay for text readability */}
        <div className='absolute inset-0 bg-black/50' />

        <div className='relative z-10 flex flex-col items-center gap-6 px-4 py-6 mx-auto text-center w-full sm:w-3/4 md:w-3/5 lg:w-1/2'>
          <h1 className='text-2xl font-bold tracking-tight text-orange-400 sm:text-3xl md:text-5xl lg:text-6xl font-mono'>
            Party Rentals Made Simple
          </h1>

          <div className='flex flex-col gap-5 text-white'>
            <p className='text-base sm:text-lg md:text-xl'>
              Planning a party or special event? J3 Party Rentals has you
              covered! We provide high-quality rental equipment to make your
              event a success, from intimate gatherings to grand celebrations.
            </p>

            <p className='text-base font-semibold sm:text-lg'>
              Our Rental Services Include:
            </p>

            <ul className='px-4 text-left list-disc sm:px-6'>
              <li>
                Chairs & Tables – Comfortable, sturdy seating for any event
                size.
              </li>
              <li>
                Tents & Canopies – Weather protection for a flawless outdoor
                experience.
              </li>
              <li>
                Tablecloths & Linens – Elegant linens to elevate your décor.
              </li>
              <li>
                Coolers – Keep drinks and perishables chilled all event long.
              </li>
            </ul>

            <p className='text-base sm:text-lg'>
              Affordable, reliable, and customer-focused. Let J3 Party Rentals
              create an unforgettable event with ease.{" "}
              <a
                href='/contact'
                className='underline text-orange-400 hover:text-orange-300 transition-colors'
              >
                Book now!
              </a>
            </p>
          </div>
        </div>
      </section>
      <section className='bg-gray-100 py-12 px-4'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-2xl md:text-4xl font-bold text-center text-gray-800 mb-8'>
            Explore Our Rentals
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Service Card */}
            <div className='relative bg-white rounded-lg shadow-md overflow-hidden group'>
              <Image
                src={pic}
                alt='Chairs and Tables'
                width={300}
                height={200}
                className='w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105'
                priority
              />
              <div className='p-4'>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                  Chairs & Tables
                </h3>
                <p className='text-gray-600 text-sm'>
                  Comfortable and sturdy seating options for any event size. We
                  offer a variety of chair styles, from basic folding chairs to
                  elegant banquet seating, along with durable tables in
                  different shapes and sizes to match your event layout.
                </p>
              </div>
            </div>
            {/* Placeholder for additional cards */}
            <div className='relative bg-white rounded-lg shadow-md overflow-hidden group'>
              <Image
                src={house} // Replace with actual image
                alt='Tents and Canopies'
                width={300}
                height={200}
                className='w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105'
              />
              <div className='p-4'>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                  Tents & Canopies
                </h3>
                <p className='text-gray-600 text-sm'>
                Protection from the elements to ensure a perfect outdoor experience. Our tents come in various sizes to accommodate different event capacities, providing shade and shelter for weddings, parties, corporate events, and more.
                </p>
              </div>
            </div>
            {/* Add more cards for Tablecloths & Linens and Coolers as needed */}
            <div className='relative bg-white rounded-lg shadow-md overflow-hidden group'>
              <Image
                src={plates} // Replace with actual image
                alt='Tents and Canopies'
                width={300}
                height={200}
                className='w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105'
              />
              <div className='p-4'>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                Kitchen Utensils 
                </h3>
                <p className='text-gray-600 text-sm'>
                Essential cooking and serving tools to make food preparation and catering seamless. From chafing dishes, serving trays, and cutlery to cooking equipment, we provide everything needed to serve your guests efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
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
      <Footer />
    </div>
  );
}
