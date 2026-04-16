import { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Upload, RefreshCw, Edit3, FileText, Clock, Shield, Building2,
  Check, X, AlertTriangle, Loader2, Newspaper, Lightbulb, Save,
} from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual Entry",
  parsed_pdf: "Parsed (PDF)",
  parsed_excel: "Parsed (Excel)",
  news: "News",
  uploaded_file: "Uploaded File",
};

const METRIC_DISPLAY: Record<string, string> = {
  revenue: "Revenue",
  total_expenses: "Total Expenses",
  ebitda: "EBITDA",
  pat: "PAT",
  aum: "AUM",
  loan_book: "Loan Book",
  users: "Users",
  employee_count: "Employee Count",
  funds_raised: "Funds Raised",
  valuation: "Valuation",
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<{ id: number; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: companies } = trpc.companies.list.useQuery();
  const { data: companyData } = trpc.companies.getWithData.useQuery(
    { id: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  const { data: files } = trpc.files.forCompany.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const updateCompany = trpc.companies.update.useMutation({
    onSuccess: () => {
      toast.success("Company updated successfully");
      utils.companies.list.invalidate();
      utils.companies.getWithData.invalidate();
      utils.companies.getAllWithData.invalidate();
      setEditingName(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadFile = trpc.files.upload.useMutation({
    onSuccess: () => {
      toast.success("File uploaded — data extracted, AI enrichment running in background");
      utils.files.forCompany.invalidate();
      utils.companies.getWithData.invalidate();
      utils.companies.getAllWithData.invalidate();
      setUploading(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setUploading(false);
    },
  });

  const refreshNews = trpc.news.refresh.useMutation({
    onSuccess: () => {
      toast.success("News refreshed successfully");
      utils.companies.getWithData.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const refreshAllNews = trpc.news.refreshAll.useMutation({
    onSuccess: () => {
      toast.success("All company news refreshed");
      utils.companies.getAllWithData.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateInsights = trpc.insights.generate.useMutation({
    onSuccess: () => {
      toast.success("Insights generated successfully");
      utils.insights.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const upsertMetric = trpc.metrics.upsert.useMutation({
    onSuccess: () => {
      toast.success("Metric saved");
      utils.companies.getWithData.invalidate();
      utils.metrics.forCompany.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompanyId) return;

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isExcel = file.type.includes("spreadsheet") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isPdf && !isExcel) {
      toast.error("Only PDF and Excel files are supported");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadFile.mutate({
        companyId: selectedCompanyId,
        fileName: file.name,
        fileType: isPdf ? "pdf" : "excel",
        fileBase64: base64,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [selectedCompanyId, uploadFile]);

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-card border-border max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-lg font-medium">Admin Access Required</h2>
            <p className="text-sm text-muted-foreground mt-2">
              You need admin privileges to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage companies, upload data, and control the intelligence pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshAllNews.mutate()}
            disabled={refreshAllNews.isPending}
          >
            {refreshAllNews.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Newspaper className="h-4 w-4 mr-2" />}
            Refresh All News
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateInsights.mutate({ peerGroup: "wealth_management" })}
            disabled={generateInsights.isPending}
          >
            {generateInsights.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
            Generate WM Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateInsights.mutate({ peerGroup: "p2p_lending" })}
            disabled={generateInsights.isPending}
          >
            {generateInsights.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
            Generate P2P Insights
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company List */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[70vh] overflow-y-auto">
              {companies?.map((company) => (
                <div
                  key={company.id}
                  className={`flex items-center justify-between px-4 py-3 border-b border-border/50 cursor-pointer transition-colors ${
                    selectedCompanyId === company.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-secondary/50"
                  }`}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo displayName={company.displayName} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{company.displayName}</p>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 mt-0.5">
                        {company.peerGroup === "wealth_management" ? "WM" : "P2P"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingName({ id: company.id, name: company.displayName });
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCompanyId && companyData ? (
            <>
              {/* Company Header */}
              <Card className="bg-card border-border">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CompanyLogo displayName={companyData.displayName} size="md" />
                      <div>
                        <h2 className="text-lg font-semibold">{companyData.displayName}</h2>
                        <p className="text-xs text-muted-foreground">
                          Internal name: {companyData.name} | Last updated: {new Date(companyData.lastUpdated).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshNews.mutate({ companyId: selectedCompanyId })}
                        disabled={refreshNews.isPending}
                      >
                        {refreshNews.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                        Refresh News
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                        Upload File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.xlsx,.xls"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Editor */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Parsed Data & Manual Override</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(METRIC_DISPLAY).map(([key, label]) => {
                      const metric = companyData.metrics?.[key];
                      return (
                        <MetricEditor
                          key={key}
                          label={label}
                          metricName={key}
                          companyId={selectedCompanyId}
                          currentValue={metric?.value}
                          currentUnit={metric?.unit}
                          currentSource={metric?.source}
                          currentPeriod={metric?.period}
                          onSave={(value, unit, period) => {
                            upsertMetric.mutate({
                              companyId: selectedCompanyId,
                              metricName: key,
                              metricValue: value,
                              metricUnit: unit,
                              period: period,
                              source: "manual",
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upload History */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Upload History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {files && files.length > 0 ? (
                    <div className="space-y-2">
                      {files.map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{f.fileName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{f.fileType.toUpperCase()}</Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                                  {new Date(f.createdAt).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={f.status === "parsed" ? "default" : f.status === "failed" ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            {f.status === "parsed" && <Check className="h-2.5 w-2.5 mr-1" />}
                            {f.status === "failed" && <X className="h-2.5 w-2.5 mr-1" />}
                            {f.status === "parsing" && <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />}
                            {f.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No files uploaded yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="py-20 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-muted-foreground">Select a company from the list to manage its data.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Name Edit Dialog */}
      {editingName && (
        <Dialog open={!!editingName} onOpenChange={() => setEditingName(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Company Display Name</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editingName.name}
                onChange={(e) => setEditingName({ ...editingName, name: e.target.value })}
                placeholder="Display name"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This alias will be used consistently across the entire dashboard.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingName(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  updateCompany.mutate({ id: editingName.id, displayName: editingName.name });
                }}
                disabled={updateCompany.isPending}
              >
                {updateCompany.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function MetricEditor({ label, metricName, companyId, currentValue, currentUnit, currentSource, currentPeriod, onSave }: {
  label: string; metricName: string; companyId: number;
  currentValue?: string; currentUnit?: string; currentSource?: string; currentPeriod?: string;
  onSave: (value: string, unit: string, period: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentValue || "");
  const [unit, setUnit] = useState(currentUnit || "INR Cr");
  const [period, setPeriod] = useState(currentPeriod || "FY2024");
  const [error, setError] = useState<string | null>(null);

  // Sync local state when server data updates (e.g. after parse/save)
  useEffect(() => {
    if (!editing) {
      setValue(currentValue || "");
      setUnit(currentUnit || "INR Cr");
      setPeriod(currentPeriod || "FY2024");
    }
  }, [currentValue, currentUnit, currentPeriod, editing]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed === "") { setError("Value cannot be empty"); return; }
    const num = parseFloat(trimmed);
    if (isNaN(num)) { setError("Must be a valid number"); return; }
    setError(null);
    onSave(trimmed, unit, period);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors">
      <div className="w-32 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        {editing ? (
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-1.5">
              <Input value={value} onChange={e => { setValue(e.target.value); setError(null); }} placeholder="Value" className="h-7 text-xs bg-secondary w-24" />
              <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit" className="h-7 text-xs bg-secondary w-20" />
              <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="Period" className="h-7 text-xs bg-secondary w-20" />
              <Button size="sm" className="h-7 px-2" onClick={handleSave}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditing(false); setError(null); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            {error && <span className="text-[10px] text-destructive ml-1">{error}</span>}
          </div>
        ) : (
          <>
            <span className="text-sm font-mono">
              {currentValue || <span className="text-muted-foreground/40">Not set</span>}
            </span>
            {currentUnit && <span className="text-xs text-muted-foreground">{currentUnit}</span>}
            {currentPeriod && <span className="text-xs text-muted-foreground/60">({currentPeriod})</span>}
            {currentSource && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-2">
                {SOURCE_LABELS[currentSource] || currentSource}
              </Badge>
            )}
            <Button size="sm" variant="ghost" className="h-6 px-1.5 ml-auto" onClick={() => {
              setValue(currentValue || "");
              setUnit(currentUnit || "INR Cr");
              setPeriod(currentPeriod || "FY2024");
              setError(null);
              setEditing(true);
            }}>
              <Edit3 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
