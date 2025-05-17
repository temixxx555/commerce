'use client'
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const AllProducts = () => {
    const { products } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Get unique categories from product list (optional if dynamic)
    const categories = [
        'All',
        'Plates',
        'Outdoors',
        'Indoors',
        'Events',
        'Clothes',
        'Foodstuffs',
        'Accessories'
    ];

    // Filter products based on selected category
    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(product => product.category === selectedCategory);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
                {/* Category Filter Dropdown */}
                <div className="mt-10">
                    <label htmlFor="category" className="mr-2 font-medium">Filter by Category:</label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Heading */}
                <div className="flex flex-col items-end pt-8">
                    <p className="text-2xl font-medium">
                        {selectedCategory === "All" ? "All Products" : selectedCategory}
                    </p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8 pb-14 w-full">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))
                    ) : (
                        <p className="text-gray-500">No products in this category.</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
