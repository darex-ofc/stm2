import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { AlertTriangle, FileText, Lock, DollarSign, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const StudentReports = () => {
  const { user } = useAuth();
  const [reportsLocked, setReportsLocked] = useState(true);
  const [hasFeeBalance, setHasFeeBalance] = useState(false);
  const [feeBalance, setFeeBalance] = useState(0);
  const [unpaidTerms, setUnpaidTerms] = useState<string[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [monthlyTests, setMonthlyTests] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [term, setTerm] = useState("term_1");
  const [year, setYear] = useState(new Date().getFullYear());
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Check if reports are locked by admin
      const { data: settingsData } = await supabase.from("system_settings").select("value").eq("key", "reports_locked").single();
      setReportsLocked(settingsData?.value === "true");

      // Check fee balance
      const { data: feesData } = await supabase.from("fee_records").select("*").eq("student_id", user.id).is("deleted_at", null);
      let totalBal = 0;
      const owingTerms: string[] = [];
      (feesData || []).forEach(f => {
        const bal = Number(f.amount_due) - Number(f.amount_paid);
        if (bal > 0) { totalBal += bal; owingTerms.push(`${f.term.replace("_", " ").toUpperCase()} ${f.academic_year}`); }
      });
      setFeeBalance(totalBal);
      setHasFeeBalance(totalBal > 0);
      setUnpaidTerms([...new Set(owingTerms)]);

      // Student profile
      const { data: sp } = await supabase.from("student_profiles").select("*").eq("user_id", user.id).single();
      setStudentProfile(sp);

      // Grades
      const { data: gradesData } = await supabase.from("grades").select("*, subjects(name, code)")
        .eq("student_id", user.id).eq("term", term as any).eq("academic_year", year).is("deleted_at", null);
      setGrades(gradesData || []);

      // Monthly tests
      const { data: testsData } = await supabase.from("monthly_tests").select("*, subjects(name)")
        .eq("student_id", user.id).eq("academic_year", year).is("deleted_at", null).order("month");
      setMonthlyTests(testsData || []);

      // Attendance
      const { data: attData } = await supabase.from("attendance").select("*")
        .eq("student_id", user.id).order("date", { ascending: false }).limit(50);
      setAttendance(attData || []);
    };
    fetchData();
  }, [user, term, year]);

  const canViewReports = !reportsLocked && !hasFeeBalance;
  const avgMark = grades.length > 0 ? Math.round(grades.reduce((s, g) => s + Number(g.mark), 0) / grades.length) : 0;
  const presentCount = attendance.filter(a => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Academic Records</h1>
          <p className="text-sm text-muted-foreground">View your report cards, monthly test results, and attendance</p>
        </div>

        {/* Blocked Messages */}
        {reportsLocked && (
          <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-yellow-600 shrink-0" />
              <div>
                <p className="font-bold text-yellow-700">Report Cards Are Currently Locked</p>
                <p className="text-sm text-yellow-600">Teachers are still setting up reports. Report cards will be available once the administration unlocks them.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!reportsLocked && hasFeeBalance && (
          <Card className="border-l-4 border-l-red-500 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-red-700">Report Cards Blocked — Outstanding Fees</p>
                <p className="text-sm text-red-600">
                  You have an unpaid balance of <strong>${feeBalance.toFixed(2)}</strong> for: {unpaidTerms.join(", ")}
                </p>
                <p className="text-sm text-red-600 mt-1">Please clear your fee balance to access report cards.</p>
              </div>
              <Link to="/student/fees">
                <Badge variant="destructive"><DollarSign className="w-3 h-3 mr-1" /> View Fees</Badge>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select className="border border-input rounded-lg px-3 py-2 bg-background text-foreground text-sm" value={term} onChange={e => setTerm(e.target.value)}>
            <option value="term_1">Term 1</option><option value="term_2">Term 2</option><option value="term_3">Term 3</option>
          </select>
          <select className="border border-input rounded-lg px-3 py-2 bg-background text-foreground text-sm" value={year} onChange={e => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <Tabs defaultValue="report">
          <TabsList>
            <TabsTrigger value="report"><FileText className="w-4 h-4 mr-1" /> Report Card</TabsTrigger>
            <TabsTrigger value="monthly"><BookOpen className="w-4 h-4 mr-1" /> Monthly Tests</TabsTrigger>
            <TabsTrigger value="attendance"><ClipboardCheck className="w-4 h-4 mr-1" /> Attendance</TabsTrigger>
          </TabsList>

          {/* Report Card Tab */}
          <TabsContent value="report" className="space-y-4">
            {canViewReports ? (
              <>
                {grades.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card><CardContent className="p-4 text-center">
                      <p className={`text-2xl font-bold ${avgMark >= 60 ? "text-green-600" : avgMark >= 40 ? "text-yellow-600" : "text-red-600"}`}>{avgMark}%</p>
                      <p className="text-xs text-muted-foreground">Average Mark</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{grades.length}</p>
                      <p className="text-xs text-muted-foreground">Subjects</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{term.replace("_", " ").toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{year}</p>
                    </CardContent></Card>
                  </div>
                )}

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {term.replace("_", " ").toUpperCase()} {year} Report Card</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead>#</TableHead><TableHead>Subject</TableHead><TableHead>Code</TableHead><TableHead>Mark</TableHead><TableHead>Grade</TableHead><TableHead>Comment</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {grades.map((g, i) => (
                          <TableRow key={g.id} className={Number(g.mark) >= 75 ? "bg-green-500/5" : Number(g.mark) < 40 ? "bg-red-500/5" : ""}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell className="font-medium">{g.subjects?.name}</TableCell>
                            <TableCell>{g.subjects?.code || "—"}</TableCell>
                            <TableCell className="font-bold">{g.mark}%</TableCell>
                            <TableCell><Badge variant="outline">{g.grade_letter || "—"}</Badge></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{g.comment || "—"}</TableCell>
                          </TableRow>
                        ))}
                        {grades.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No grades recorded for this term.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Report cards are not available at this time.</p>
                  <p className="text-sm mt-1">{reportsLocked ? "Reports are locked by administration." : "Please clear your outstanding fee balance."}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Monthly Tests Tab */}
          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Monthly Test Results — {year}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Month</TableHead><TableHead>Subject</TableHead><TableHead>Mark</TableHead><TableHead>Grade</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyTests.map(t => (
                      <TableRow key={t.id} className={Number(t.mark) >= 75 ? "bg-green-500/5" : Number(t.mark) < 40 ? "bg-red-500/5" : ""}>
                        <TableCell>{["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][t.month]}</TableCell>
                        <TableCell className="font-medium">{t.subjects?.name || "—"}</TableCell>
                        <TableCell className="font-bold">{t.mark}%</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={Number(t.mark) >= 75 ? "text-green-600" : Number(t.mark) >= 50 ? "text-yellow-600" : "text-red-600"}>
                            {Number(t.mark) >= 75 ? "A" : Number(t.mark) >= 60 ? "B" : Number(t.mark) >= 50 ? "C" : Number(t.mark) >= 40 ? "D" : "F"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {monthlyTests.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No monthly test results yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{attendance.length}</p><p className="text-xs text-muted-foreground">Total Days</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{presentCount}</p><p className="text-xs text-muted-foreground">Present</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{attendance.filter(a => a.status === "absent").length}</p><p className="text-xs text-muted-foreground">Absent</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{attendanceRate}%</p>
                <p className="text-xs text-muted-foreground">Rate</p>
                <Progress value={attendanceRate} className="h-1.5 mt-2" />
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> Recent Attendance</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {attendance.slice(0, 30).map(a => {
                      const colors: Record<string, string> = {
                        present: "bg-green-500/10 text-green-700",
                        absent: "bg-red-500/10 text-red-700",
                        late: "bg-yellow-500/10 text-yellow-700",
                        excused: "bg-blue-500/10 text-blue-700",
                      };
                      return (
                        <TableRow key={a.id}>
                          <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                          <TableCell><Badge className={colors[a.status] || ""} variant="outline">{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.notes || "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                    {attendance.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No attendance records.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentReports;
