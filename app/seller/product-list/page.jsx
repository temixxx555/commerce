"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const ProductList = () => {
  const { router, getToken, user } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // Track which product is being deleted

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/Seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setProducts(data.products);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteHandler = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeleting(productId); // Show loading state for this product
      const token = await getToken();
      const { data } = await axios.delete(
        `/api/product/delete?id=${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Product deleted successfully");
        // Update products state to remove the deleted product
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete product: " + error.message);
    } finally {
      setDeleting(null); // Reset loading state
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerProduct();
    }
  }, [user]);

  return (
    <div className='flex-1 min-h-screen flex flex-col justify-between'>
      {loading ? (
        <Loading />
      ) : (
        <div className='w-full md:p-10 p-4'>
          <h2 className='pb-4 text-lg font-medium'>All Products</h2>
          <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
            <table className='table-fixed w-full overflow-hidden'>
              <thead className='text-gray-900 text-sm text-left'>
                <tr>
                  <th className='w-2/3 md:w-2/5 px-4 py-3 font-medium truncate'>
                    Product
                  </th>
                  <th className='px-4 py-3 font-medium truncate max-sm:hidden'>
                    Category
                  </th>
                  <th className='px-4 py-3 font-medium truncate max-sm:hidden'>
                    Action
                  </th>
                  <th className='px-4 py-3 font-medium truncate'>Price</th>
                  <th className='px-4 py-3 font-medium truncate max-sm:hidden'>
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-500'>
                {products.map((product, index) => (
                  <tr key={index} className='border-t border-gray-500/20'>
                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                      <div className='bg-gray-500/10 rounded p-2'>
                        <Image
                          src={product.image[0] || assets.placeholder}
                          alt='product Image'
                          className='w-16'
                          width={1280}
                          height={720}
                        />
                      </div>
                      <span className='truncate w-full'>{product.name}</span>
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {product.category}
                    </td>
                    <td className='px-4 py-3'>${product.offerPrice}</td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      <button
                        onClick={() => deleteHandler(product._id)}
                        className='flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-gray-600 text-white rounded-md disabled:opacity-50'
                        disabled={deleting === product._id}
                      >
                        <span className='hidden md:block'>
                          {deleting === product._id ? "Deleting..." : "Delete"}
                        </span>
                        <Image
                          className='h-3.5'
                          src={assets.redirect_icon}
                          alt='redirect_icon'
                        />
                      </button>
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      <button
                        onClick={() =>
                          router.push(`/edit-product/${product._id}`)
                        }
                        className='flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md'
                      >
                        <span className='hidden md:block'>Update</span>
                        <Image
                          className='h-3.5'
                          src={assets.redirect_icon}
                          alt='redirect_icon'
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
