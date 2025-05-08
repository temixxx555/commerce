"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { blogPosts } from "@/data/blogPosts"; // We'll create this data file next
import Footer from "./Footer";

const BlogPostPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the post with the matching id
    const postId = parseInt(id);
    const foundPost = blogPosts.find(post => post.id === postId);
    
    if (foundPost) {
      setPost(foundPost);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h1 className="text-3xl font-bold mb-6">Post not found</h1>
          <p className="mb-8">Sorry, the blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-teal-500 hover:underline">
            ← Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 py-20">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blog" className="text-orange-500 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to all posts
          </Link>
        </div>
        
        {/* Post header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
          
          <div className="flex items-center mb-6">
            <img src="/avatar.jpg" className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" />
            <div>
              <p className="font-medium">{post.author}</p>
              <div className="flex text-sm text-gray-400">
                <span>{post.date}</span>
                <span className="mx-1">•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Featured image */}
        <div className="w-full h-96 bg-teal-500 bg-opacity-20 mb-10 rounded-lg overflow-hidden">
          <img 
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Post content */}
        <div className="prose prose-invert max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('##')) {
              // Handle subheadings (h2)
              return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
            } else if (paragraph.startsWith('-')) {
              // Handle bullet points
              return (
                <ul key={index} className="list-disc pl-6 mb-6">
                  {paragraph.split('\n').map((item, itemIndex) => (
                    <li key={itemIndex} className="mb-2">{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            } else {
              // Regular paragraphs
              return <p key={index} className="mb-6">{paragraph}</p>;
            }
          })}
        </div>
        
        {/* Post footer - stats */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center text-gray-400">
            <span>{post.views} views</span>
            <span className="mx-2">•</span>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogPostPage;