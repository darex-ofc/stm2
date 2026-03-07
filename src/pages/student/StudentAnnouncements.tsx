import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Pin } from "lucide-react";

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("announcements").select("*, profiles:author_id(full_name)").is("deleted_at", null).order("is_pinned", { ascending: false }).order("created_at", { ascending: false })
      .then(({ data }) => setAnnouncements(data || []));
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Announcements</h1>
        {announcements.length === 0 ? (
          <p className="text-muted-foreground">No announcements at this time.</p>
        ) : (
          announcements.map(a => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {a.is_pinned && <Pin className="w-4 h-4 text-secondary shrink-0 mt-1" />}
                  <div>
                    <p className="font-bold text-foreground">{a.title}</p>
                    {(a as any).profiles?.full_name && (
                      <p className="text-xs font-medium text-primary mt-0.5">
                        — {(a as any).profiles.full_name.split(" ").length > 1 
                          ? `Mr/Mrs ${(a as any).profiles.full_name.split(" ").slice(-1)[0]}` 
                          : (a as any).profiles.full_name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAnnouncements;
