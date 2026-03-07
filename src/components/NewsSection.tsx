import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const NewsSection = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("homepage_updates")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setUpdates(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (updates.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Latest News & Updates</h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {updates.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-border"
            >
              {item.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-3 bg-secondary" />
              )}
              <div className="p-6">
                <p className="font-body text-sm text-muted-foreground mb-2">
                  {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="font-body text-muted-foreground mb-4 leading-relaxed line-clamp-3">{item.description}</p>
                <Link to="/news" className="font-body text-primary font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/news"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-body font-semibold hover:opacity-90 transition-opacity"
          >
            View All News
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
