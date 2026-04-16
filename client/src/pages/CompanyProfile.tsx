import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ExternalLink, DollarSign, TrendingUp, TrendingDown, Users,
  Building2, Briefcase, Wallet, Landmark, Scale, FileText, Clock,
} from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual Entry",
  parsed_pdf: "Parsed (PDF)",
  parsed_excel: "Parsed (Excel)",
  news: "News",
  uploaded_file: "Uploaded File",
};

function formatValue(value: string | undefined, unit?: string): string {
  if (!value || value === "N/A") return "Not Available";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (unit === "count") {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString("en-IN");
  }
  const absNum = Math.abs(num);
  if (absNum >= 1000) return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
  if (absNum >= 1 && num === Math.floor(num)) return `₹${num.toLocaleString("en-IN")} Cr`;
  if (absNum >= 1) return `₹${num.toFixed(1)} Cr`;
  return `₹${num.toFixed(2)} Cr`;
}

function DetailMetric({ label, value, unit, source, period, icon: Icon }: {
  label: string; value?: string; unit?: string; source?: string; period?: string; icon?: any;
}) {
  const display = formatValue(value, unit);
  const isNA = display === "Not Available";
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <span className="metric-label">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/40" />}
      </div>
      <span className={`metric-value ${isNA ? "text-muted-foreground/40 text-lg" : ""}`}>{display}</span>
      <div className="flex items-center gap-2 mt-1">
        {source && (
          <span className="metric-source">{SOURCE_LABELS[source] || source}</span>
        )}
        {period && (
          <span className="text-[10px] text-muted-foreground/40">{period}</span>
        )}
      </div>
    </div>
  );
}

export default function CompanyProfile() {
  const [, params] = useRoute("/company/:id");
  const [, setLocation] = useLocation();
  const companyId = params?.id ? parseInt(params.id) : 0;

  const { data: company, isLoading } = trpc.companies.getWithData.useQuery(
    { id: companyId },
    { enabled: companyId > 0 }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-lg font-medium text-foreground">Company not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const m = company.metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <CompanyLogo displayName={company.displayName} size="lg" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{company.displayName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {company.peerGroup === "wealth_management" ? "Wealth Management" : "P2P Lending"}
                  </Badge>
                  {company.category && <Badge variant="secondary" className="text-xs">{company.category}</Badge>}
                  {(company.tags as string[] || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <Clock className="h-3 w-3 inline mr-1" />
          Last updated: {new Date(company.lastUpdated).toLocaleDateString("en-IN")}
        </div>
      </div>

      {/* Product Offerings */}
      {company.productOfferings && company.productOfferings.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Product Offerings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {company.productOfferings.map((p: string, i: number) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {p}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Metrics */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Financial Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DetailMetric label="Revenue" value={m.revenue?.value} unit={m.revenue?.unit} source={m.revenue?.source} period={m.revenue?.period} icon={DollarSign} />
          <DetailMetric label="Total Expenses" value={m.total_expenses?.value} unit={m.total_expenses?.unit} source={m.total_expenses?.source} period={m.total_expenses?.period} icon={TrendingDown} />
          <DetailMetric label="EBITDA" value={m.ebitda?.value} unit={m.ebitda?.unit} source={m.ebitda?.source} period={m.ebitda?.period} icon={TrendingUp} />
          <DetailMetric label="PAT" value={m.pat?.value} unit={m.pat?.unit} source={m.pat?.source} period={m.pat?.period} icon={TrendingUp} />
        </div>
      </div>

      {/* Valuation & Funding */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Valuation & Funding</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DetailMetric label="Valuation" value={m.valuation?.value} unit={m.valuation?.unit} source={m.valuation?.source} period={m.valuation?.period} icon={Landmark} />
          <DetailMetric label="Funds Raised" value={m.funds_raised?.value} unit={m.funds_raised?.unit} source={m.funds_raised?.source} period={m.funds_raised?.period} icon={Wallet} />
          <DetailMetric label={company.peerGroup === "p2p_lending" ? "Loan Book" : "AUM"} value={company.peerGroup === "p2p_lending" ? m.loan_book?.value : m.aum?.value} unit={company.peerGroup === "p2p_lending" ? m.loan_book?.unit : m.aum?.unit} source={company.peerGroup === "p2p_lending" ? m.loan_book?.source : m.aum?.source} icon={company.peerGroup === "p2p_lending" ? Scale : Briefcase} />
          <DetailMetric label="Users / Customers" value={m.users?.value} unit="count" source={m.users?.source} icon={Users} />
        </div>
      </div>

      {/* Operational */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Operational</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DetailMetric label="Employee Count" value={m.employee_count?.value} unit="count" source={m.employee_count?.source} icon={Users} />
          <div className="metric-card">
            <span className="metric-label">Files Uploaded</span>
            <span className="metric-value">{company.fileCount}</span>
          </div>
        </div>
      </div>

      {/* Latest Business Updates */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" /> Latest Business Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {company.news && company.news.length > 0 ? (
            <div className="space-y-3">
              {company.news.map((n: any) => (
                <a
                  key={n.id}
                  href={n.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{n.headline}</p>
                    {n.summary && <p className="text-xs text-muted-foreground mt-1">{n.summary}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{n.source}</Badge>
                      {n.publishedAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(n.publishedAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                      <span className="metric-source">Source: News</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No business updates available yet.</p>
              <p className="text-xs mt-1 text-muted-foreground/60">Refresh news from the Admin Panel.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
