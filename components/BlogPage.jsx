"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { blogPosts } from "@/data/blogPosts";
import Footer from "./Footer";

const BlogPage = () => {
  const [posts, setPosts] = useState(blogPosts);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const filtered = blogPosts.filter(
        post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPosts(filtered);
    } else {
      setPosts(blogPosts);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Blog Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-4xl text-orange-500 md:text-5xl font-bold mb-6 md:mb-0" style={{ fontFamily: 'cursive' }}>
            Our Blog Posts
          </h1>
          
          {/* Search Bar */}
          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 pl-10 rounded-full bg-white border border-orange-300 text-black focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition"
              />
              <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Blog List - Single line layout */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.id}`}
              className="block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-orange-500"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Container */}
                <div className="w-full md:w-1/4 h-56 md:h-auto relative">
                  <div className="w-full h-full bg-[#E6E9F2] flex items-center justify-center">
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Content Container */}
                <div className="w-full md:w-3/4 p-6 flex flex-col justify-between">
                  {/* Title and Author info in one line */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">{post.title}</h2>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white mr-2 flex items-center justify-center">
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{post.author}</p>
                        <div className="flex text-xs text-gray-500">
                          <span>{post.date}</span>
                          <span className="mx-1">•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  
                  {/* Footer with stats and read more button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{post.views} views</span>
                      <span className="mx-2">•</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-orange-500 font-medium text-sm">Read More →</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;