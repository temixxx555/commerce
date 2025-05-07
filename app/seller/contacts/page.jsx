"use client";

import { useAuth } from "@clerk/nextjs"; // Use Clerk's useAuth
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ContactListPage = () => {
  const { getToken } = useAuth(); // Use Clerk for authentication
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const { data } = await axios.get("/api/detail/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setContacts([...data.details].reverse()); // Reverse a copy of the array
        toast.success("Contacts fetched successfully");
      } else {
        toast.error(data.message || "Failed to fetch contacts");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred while fetching contacts";
      toast.error(errorMessage);
      console.error("Fetch contacts error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Contact List</h1>
      {isLoading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p>No contacts found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">First Name</th>
              <th className="border p-2">Last Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact._id} className="hover:bg-gray-100">
                <td className="border p-2">{contact.firstName}</td>
                <td className="border p-2">{contact.lastName}</td>
                <td className="border p-2">{contact.email}</td>
                <td className="border p-2">{contact.number}</td>
                <td className="border p-2">{contact.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContactListPage;