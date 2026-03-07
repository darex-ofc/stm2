import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, RotateCcw, FileDown, BarChart3 } from "lucide-react";

import FeeStructureCard from "@/components/admin/fees/FeeStructureCard";
import FeeStatsCards from "@/components/admin/fees/FeeStatsCards";
import AddFeeForm from "@/components/admin/fees/AddFeeForm";
import FeeRecordsTable from "@/components/admin/fees/FeeRecordsTable";
import FeeCharts from "@/components/admin/fees/FeeCharts";
import PaymentDialog from "@/components/admin/fees/PaymentDialog";
import { DEFAULT_FEE_STRUCTURE, DEFAULT_ZIG_RATE, PAYMENT_METHODS } from "@/components/admin/fees/FeeConstants";
import { printReceipt, generateCSVReport } from "@/components/admin/fees/ReceiptPrinter";

const AdminFees = () => {
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [deletedFees, setDeletedFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterTerm, setFilterTerm] = useState("");
  const [zigRate, setZigRate] = useState(DEFAULT_ZIG_RATE);
  const [feeStructure, setFeeStructure] = useState(DEFAULT_FEE_STRUCTURE);
  const [showCharts, setShowCharts] = useState(false);

  // Payment dialog
  const [payRecord, setPayRecord] = useState<any>(null);
  const [payOpen, setPayOpen] = useState(false);

  // Edit dialog
  const [editFee, setEditFee] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [feeRes, profilesRes, rolesRes, sessionsRes, spRes] = await Promise.all([
      supabase.from("fee_records").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*").eq("role", "student"),
      supabase.from("academic_sessions").select("*").order("academic_year"),
      supabase.from("student_profiles").select("*"),
    ]);
    const profiles = profilesRes.data || [];
    const studentIds = new Set((rolesRes.data || []).map((r: any) => r.user_id));
    setStudents(profiles.filter((p: any) => studentIds.has(p.user_id)));
    setStudentProfiles(spRes.data || []);
    const all = feeRes.data || [];
    setFeeRecords(all.filter((f: any) => !f.deleted_at));
    setDeletedFees(all.filter((f: any) => f.deleted_at));
    setSessions(sessionsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getStudentName = (id: string) => students.find((s) => s.user_id === id)?.full_name || "Unknown";
  const years = [...new Set(sessions.map((s) => s.academic_year))].sort((a: number, b: number) => b - a);
  if (years.length === 0) years.push(new Date().getFullYear());

  const filtered = feeRecords.filter((f) => {
    const name = getStudentName(f.student_id).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (f.receipt_number || "").toLowerCase().includes(search.toLowerCase());
    const matchYear = !filterYear || f.academic_year === parseInt(filterYear);
    const matchTerm = !filterTerm || f.term === filterTerm;
    return matchSearch && matchYear && matchTerm;
  });

  const totalDue = filtered.reduce((s, f) => s + Number(f.amount_due), 0);
  const totalPaid = filtered.reduce((s, f) => s + Number(f.amount_paid), 0);

  const handleDelete = async (id: string) => {
    await supabase.from("fee_records").update({ deleted_at: new Date().toISOString() } as any).eq("id", id);
    toast({ title: "Fee Record Deleted" });
    fetchData();
  };

  const handleRestore = async (id: string) => {
    await supabase.from("fee_records").update({ deleted_at: null } as any).eq("id", id);
    toast({ title: "Fee Record Restored" });
    fetchData();
  };

  const handleEditSave = async () => {
    if (!editFee) return;
    const { error } = await supabase.from("fee_records").update({
      amount_due: Number(editFee.amount_due),
      amount_paid: Number(editFee.amount_paid),
      notes: editFee.notes,
      payment_method: editFee.payment_method,
      term: editFee.term,
      academic_year: Number(editFee.academic_year),
    } as any).eq("id", editFee.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Fee Updated" }); setEditOpen(false); fetchData(); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Fee Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCharts(!showCharts)}>
              <BarChart3 className="w-4 h-4 mr-1" /> {showCharts ? "Hide Charts" : "Charts"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateCSVReport(filtered, getStudentName, zigRate)}>
              <FileDown className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </div>

        <FeeStructureCard
          feeStructure={feeStructure}
          zigRate={zigRate}
          onFeeStructureChange={setFeeStructure}
          onZigRateChange={setZigRate}
        />

        <FeeStatsCards totalDue={totalDue} totalPaid={totalPaid} zigRate={zigRate} />

        {showCharts && <FeeCharts records={filtered} getStudentName={getStudentName} />}

        <AddFeeForm
          students={students}
          studentProfiles={studentProfiles}
          feeStructure={feeStructure}
          zigRate={zigRate}
          years={years}
          onAdded={fetchData}
        />

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or receipt..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select className="border border-input rounded-lg px-3 py-2 bg-background text-sm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="border border-input rounded-lg px-3 py-2 bg-background text-sm" value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}>
              <option value="">All Terms</option>
              <option value="term_1">Term 1</option>
              <option value="term_2">Term 2</option>
              <option value="term_3">Term 3</option>
            </select>
          </CardContent>
        </Card>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Records ({filtered.length})</TabsTrigger>
            <TabsTrigger value="deleted">Deleted ({deletedFees.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <FeeRecordsTable
              records={filtered}
              loading={loading}
              zigRate={zigRate}
              getStudentName={getStudentName}
              onPay={(r) => { setPayRecord(r); setPayOpen(true); }}
              onEdit={(r) => { setEditFee({ ...r }); setEditOpen(true); }}
              onDelete={handleDelete}
              onPrintReceipt={(r) => printReceipt(r, getStudentName(r.student_id), zigRate)}
            />
          </TabsContent>

          <TabsContent value="deleted">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Deleted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletedFees.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No deleted records.</TableCell></TableRow>
                    ) : deletedFees.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{getStudentName(f.student_id)}</TableCell>
                        <TableCell>${Number(f.amount_due).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(f.deleted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRestore(f.id)}>
                            <RotateCcw className="w-4 h-4 text-primary mr-1" /> Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <PaymentDialog
          record={payRecord}
          open={payOpen}
          onOpenChange={setPayOpen}
          zigRate={zigRate}
          getStudentName={getStudentName}
          onPaid={fetchData}
        />

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Fee Record</DialogTitle></DialogHeader>
            {editFee && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">{getStudentName(editFee.student_id)}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Year</label>
                    <Input type="number" value={editFee.academic_year} onChange={(e) => setEditFee({ ...editFee, academic_year: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Term</label>
                    <select className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm" value={editFee.term} onChange={(e) => setEditFee({ ...editFee, term: e.target.value })}>
                      <option value="term_1">Term 1</option>
                      <option value="term_2">Term 2</option>
                      <option value="term_3">Term 3</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Amount Due (USD)</label>
                    <Input type="number" value={editFee.amount_due} onChange={(e) => setEditFee({ ...editFee, amount_due: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Amount Paid (USD)</label>
                    <Input type="number" value={editFee.amount_paid} onChange={(e) => setEditFee({ ...editFee, amount_paid: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Payment Method</label>
                  <select className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm" value={editFee.payment_method || "cash"} onChange={(e) => setEditFee({ ...editFee, payment_method: e.target.value })}>
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <Input value={editFee.notes || ""} onChange={(e) => setEditFee({ ...editFee, notes: e.target.value })} />
                </div>
                <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminFees;
