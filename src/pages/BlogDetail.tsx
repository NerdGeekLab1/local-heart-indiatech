import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts } from "@/lib/data";

const BlogDetail = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground text-lg">Blog post not found</p>
          <Link to="/community?tab=blog" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <Link to="/community?tab=blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero Image */}
          <div className="rounded-2xl overflow-hidden mb-8 h-64 sm:h-80 lg:h-96">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{post.category}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} read</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">{post.title}</h1>

          {/* Author */}
          <div className="flex items-center gap-3 mt-6 pb-6 border-b border-border">
            <img src={post.authorImage} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-foreground">{post.author}</p>
              <p className="text-xs text-muted-foreground">Travel Writer</p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-8 prose prose-sm max-w-none text-foreground/90 leading-relaxed space-y-4">
            <p className="text-lg text-muted-foreground font-medium">{post.excerpt}</p>
            <div className="whitespace-pre-line text-base leading-7">{post.content}</div>
          </div>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-secondary text-muted-foreground px-3 py-1.5 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map(p => (
                <Link key={p.id} to={`/blog/${p.id}`} className="block group">
                  <div className="rounded-xl bg-card shadow-card overflow-hidden hover:shadow-card-hover transition-all">
                    <div className="h-32 overflow-hidden">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{p.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
