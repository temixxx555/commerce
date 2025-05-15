"use client";
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import debounce from 'lodash/debounce';

const AddAddress = () => {
  const { getToken, router } = useAppContext();
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Debounced function to fetch address from postal code
  const fetchAddressFromPostalCode = useCallback(
    debounce(async (pincode) => {
      if (!pincode || pincode.length < 5) {
        toast.error("Please enter a valid postal code");
        return;
      }

      setIsLoading(true);
      try {
        // Use Nominatim's search API to get address from postal code
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&addressdetails=1`
        );
        const data = await res.json();

        console.log("Nominatim Postal Code Response:", data);

        if (data.length === 0) {
          toast.error("No address found for this postal code");
          return;
        }

        const { address: addr } = data[0]; // Take the first result
console.log();

        // Construct area from available components
        const areaParts = [
          addr.house_number || "",
          addr.road || "",
          addr.neighbourhood || "",
          addr.suburb || "",
          addr.village || "",
          addr.county || "",
        ].filter(Boolean);

        const areaString = areaParts.length > 0 ? areaParts.join(", ") : "";

        setAddress((prev) => ({
          ...prev,
          area: areaString || prev.area,
          city: addr.city || addr.town || addr.village || prev.city,
          state: addr.state || prev.state,
          pincode, // Keep the entered pincode
        }));

        toast.success("Address updated from postal code!");
      } catch (err) {
        console.error("Postal code lookup error:", err);
        toast.error("Failed to fetch address for postal code");
      } finally {
        setIsLoading(false);
      }
    }, 500), // 500ms debounce delay
    []
  );

  // Handle postal code input change
  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setAddress((prev) => ({ ...prev, pincode }));
    if (pincode.length >= 5) {
      fetchAddressFromPostalCode(pincode); // Trigger API call
    }
  };

  // Handle "Use My Location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();

          console.log("Nominatim Geolocation Response:", data);

          const { address: addr } = data;

          const areaParts = [
            addr.house_number || "",
            addr.road || "",
            addr.neighbourhood || "",
            addr.suburb || "",
            addr.village || "",
            addr.county || "",
          ].filter(Boolean);

          const areaString = areaParts.length > 0 ? areaParts.join(", ") : "";

          setAddress((prev) => ({
            ...prev,
            area: areaString || prev.area,
            city: addr.city || addr.town || addr.village || prev.city,
            state: addr.state || prev.state,
            pincode: addr.postcode || prev.pincode,
          }));

          toast.success("Location detected and filled!");
        } catch (err) {
          console.error("Geolocation error:", err);
          toast.error("Failed to fetch address from coordinates");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation permission error:", error);
        toast.error("Failed to get your location");
        setIsLoading(false);
      }
    );
  };

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Cannot access token");
        return;
      }

      const { data } = await axios.post(
        "/api/user/add-address",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        router.push("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to save address");
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-500">
            Add Shipping{" "}
            <span className="font-semibold text-orange-600">Address</span>
          </p>
          <p className="text-gray-500">You can generate one by inputing your postalcode</p>
          <div className="space-y-3 max-w-sm mt-10">
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Full name"
              required
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
              value={address.fullName}
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Phone number"
              required
              onChange={(e) =>
                setAddress({ ...address, phoneNumber: e.target.value })
              }
              value={address.phoneNumber}
            />
            <div className="relative">
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="Postal code"
                required
                onChange={handlePincodeChange}
                value={address.pincode}
              />
              {isLoading && (
                <span className="absolute right-2 top-2.5 text-gray-400 text-sm">
                  Loading...
                </span>
              )}
            </div>
            <textarea
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
              rows={4}
              required
              placeholder="Address (Area and Street)"
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              value={address.area}
            />
            <div className="flex space-x-3">
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="City/District/Town"
                required
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                value={address.city}
              />
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="State"
                required
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                value={address.state}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="mt-4 bg-gray-100 text-sm px-3 py-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
            disabled={isLoading}
          >
            📍 Use My Current Location
          </button>
          <button
            type="submit"
            className="max-w-sm w-full mt-6 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase disabled:opacity-50"
            disabled={isLoading}
          >
            Save address
          </button>
        </form>
        <Image
          className="md:mr-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="my_location_image"
        />
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;