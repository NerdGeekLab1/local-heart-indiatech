import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { articleSchema, stripHtml } from "@/lib/structuredData";

const BlogDetail = () => {
  const { id } = useParams();
  const { blogs, loading } = useCmsContent();
  const { settings } = useSiteSettings();
  const post = blogs.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground text-lg">{loading ? "Loading article…" : "Blog post not found"}</p>
          <Link to="/community?tab=blog" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogs.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
  const canonical = `${(settings.base_url || "").replace(/\/$/, "")}/blog/${post.id}`;
  const description = post.excerpt || stripHtml(post.content).slice(0, 155);
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content);


  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${post.title} | Travelista`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <JsonLd data={articleSchema(settings, {
        title: post.title,
        description: post.excerpt,
        body: post.content,
        image: post.image,
        author: post.author,
        category: post.category,
        tags: post.tags,
        datePublished: post.date,
        path: `/blog/${post.id}`,
      })} />
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <Breadcrumbs className="mb-4" items={[{ label: "Community", href: "/community" }, { label: post.title }]} />
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
            {isHtml ? (
              <div className="text-base leading-7 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <div className="whitespace-pre-line text-base leading-7">{post.content}</div>
            )}
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
