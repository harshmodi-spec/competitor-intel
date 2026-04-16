import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Building2, DollarSign, Briefcase, Search,
  ChevronRight, ExternalLink, Lightbulb, BarChart3, ArrowUpRight, Layers,
  Eye, EyeOff, Landmark, Wallet, Scale, MessageSquare, Send, Loader2, Tag, Download,
} from "lucide-react";
import { Streamdown } from 'streamdown';

const CHART_COLORS = [
  "#6366f1", "#22d3ee", "#f59e0b", "#ec4899", "#10b981",
  "#8b5cf6", "#f97316", "#06b6d4", "#ef4444", "#84cc16", "#a855f7",
];

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual Entry",
  parsed_pdf: "Parsed (PDF)",
  parsed_excel: "Parsed (Excel)",
  news: "News",
  uploaded_file: "Uploaded File",
};

function formatMetricValue(value: string | undefined, unit?: string): string {
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

function SourceTag({ source }: { source: string }) {
  return (
    <span className="metric-source">
      {SOURCE_LABELS[source] || source}
    </span>
  );
}

function MetricCell({ label, value, unit, source, icon: Icon, trend }: {
  label: string; value?: string; unit?: string; source?: string;
  icon?: any; trend?: "up" | "down" | null;
}) {
  const display = formatMetricValue(value, unit);
  const isNA = display === "Not Available";
  return (
    <div className="metric-card group">
      <div className="flex items-center justify-between mb-2">
        <span className="metric-label">{label}</span>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`metric-value ${isNA ? "text-muted-foreground/40 text-base" : ""}`}>{display}</span>
        {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
        {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
      </div>
      {source && <SourceTag source={source} />}
    </div>
  );
}

function CompanyCard({ company, onClick }: { company: any; onClick: () => void }) {
  const m = company.metrics || {};
  return (
    <Card
      className="bg-card border-border hover:border-primary/30 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CompanyLogo displayName={company.displayName || "?"} size="md" />
            <div>
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                {company.displayName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                  {company.peerGroup === "wealth_management" ? "Wealth Mgmt" : "P2P Lending"}
                </Badge>
                {company.category && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    {company.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Product Offerings */}
        {company.productOfferings && company.productOfferings.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {company.productOfferings.slice(0, 3).map((p: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {p}
                </span>
              ))}
              {company.productOfferings.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  +{company.productOfferings.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCell label="Revenue" value={m.revenue?.value} unit={m.revenue?.unit} source={m.revenue?.source} icon={DollarSign} />
          <MetricCell label="EBITDA" value={m.ebitda?.value} unit={m.ebitda?.unit} source={m.ebitda?.source} icon={TrendingUp} />
          <MetricCell label="Valuation" value={m.valuation?.value} unit={m.valuation?.unit} source={m.valuation?.source} icon={Landmark} />
          <MetricCell label="Funds Raised" value={m.funds_raised?.value} unit={m.funds_raised?.unit} source={m.funds_raised?.source} icon={Wallet} />
          {company.peerGroup === "p2p_lending" ? (
            <MetricCell label="Loan Book" value={m.loan_book?.value} unit={m.loan_book?.unit} source={m.loan_book?.source} icon={Scale} />
          ) : (
            <MetricCell label="AUM" value={m.aum?.value} unit={m.aum?.unit} source={m.aum?.source} icon={Briefcase} />
          )}
          <MetricCell label="Users" value={m.users?.value} unit={m.users?.unit} source={m.users?.source} icon={Users} />
        </div>

        {/* Latest News */}
        {company.news && company.news.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Latest Updates</p>
            <div className="space-y-1.5">
              {company.news.slice(0, 2).map((n: any) => (
                <a
                  key={n.id}
                  href={n.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group/news"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 opacity-0 group-hover/news:opacity-100 transition-opacity" />
                  <span className="line-clamp-1">{n.headline}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BenchmarkingView({ companies, peerGroup }: { companies: any[]; peerGroup: string }) {
  const [hiddenCompanies, setHiddenCompanies] = useState<Set<number>>(new Set());

  const visibleCompanies = companies.filter(c => !hiddenCompanies.has(c.id));

  const toggleCompany = (id: number) => {
    setHiddenCompanies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getMetricNum = (company: any, metric: string): number => {
    const val = company.metrics?.[metric]?.value;
    if (!val || val === "N/A") return 0;
    return parseFloat(val) || 0;
  };

  const revenueData = visibleCompanies.map(c => ({
    name: c.displayName,
    value: getMetricNum(c, "revenue"),
  })).sort((a, b) => b.value - a.value);

  const profitData = visibleCompanies.map(c => ({
    name: c.displayName,
    ebitda: getMetricNum(c, "ebitda"),
    pat: getMetricNum(c, "pat"),
  }));

  const fundingData = visibleCompanies.map(c => ({
    name: c.displayName,
    value: getMetricNum(c, "funds_raised"),
  })).sort((a, b) => b.value - a.value);

  const valuationData = visibleCompanies.map(c => ({
    name: c.displayName,
    value: getMetricNum(c, "valuation"),
  })).sort((a, b) => b.value - a.value);

  const aumUsersData = visibleCompanies.map(c => ({
    name: c.displayName,
    aum: getMetricNum(c, peerGroup === "p2p_lending" ? "loan_book" : "aum"),
    users: getMetricNum(c, "users"),
  }));

  const employeeData = visibleCompanies.map(c => ({
    name: c.displayName,
    value: getMetricNum(c, "employee_count"),
  })).sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-medium text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs text-muted-foreground">
            <span style={{ color: p.color }}>{p.name || p.dataKey}: </span>
            <span className="font-mono">{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Toggle Companies</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            const tableEl = document.getElementById('benchmarking-table');
            if (!tableEl) return;
            const rows: string[][] = [];
            const headers = ['Company', 'Revenue', 'EBITDA', 'PAT', 'Valuation', 'Funds Raised', peerGroup === 'p2p_lending' ? 'Loan Book' : 'AUM', 'Users', 'Employees'];
            rows.push(headers);
            visibleCompanies.forEach(c => {
              const m = c.metrics || {} as any;
              rows.push([
                c.displayName,
                formatMetricValue(m.revenue?.value, m.revenue?.unit),
                formatMetricValue(m.ebitda?.value, m.ebitda?.unit),
                formatMetricValue(m.pat?.value, m.pat?.unit),
                formatMetricValue(m.valuation?.value, m.valuation?.unit),
                formatMetricValue(m.funds_raised?.value, m.funds_raised?.unit),
                peerGroup === 'p2p_lending' ? formatMetricValue(m.loan_book?.value, m.loan_book?.unit) : formatMetricValue(m.aum?.value, m.aum?.unit),
                formatMetricValue(m.users?.value, 'count'),
                formatMetricValue(m.employee_count?.value, 'count'),
              ]);
            });
            const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `benchmarking-${peerGroup}-${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-3 w-3 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Company Toggle */}
      <div className="flex flex-wrap gap-2">
        {companies.map((c, i) => (
          <button
            key={c.id}
            onClick={() => toggleCompany(c.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              hiddenCompanies.has(c.id)
                ? "border-border text-muted-foreground/50 bg-transparent"
                : "border-primary/30 text-foreground bg-secondary"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hiddenCompanies.has(c.id) ? "transparent" : CHART_COLORS[i % CHART_COLORS.length], border: hiddenCompanies.has(c.id) ? "1px solid currentColor" : "none" }} />
            {c.displayName}
            {hiddenCompanies.has(c.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Comparison */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Revenue Comparison (₹ Cr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 260)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Revenue" radius={[4, 4, 0, 0]}>
                    {revenueData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profit Comparison */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Profitability (₹ Cr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 260)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ebitda" name="EBITDA" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pat" name="PAT" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funding Timeline */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Funding Comparison (₹ Cr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 260)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Funds Raised" radius={[4, 4, 0, 0]}>
                    {fundingData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Valuation Comparison */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Landmark className="h-4 w-4" /> Valuation Comparison (₹ Cr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valuationData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 260)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Valuation" radius={[4, 4, 0, 0]}>
                    {valuationData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AUM / Users */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {peerGroup === "p2p_lending" ? "Loan Book" : "AUM"} & Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aumUsersData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 260)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="aum" name={peerGroup === "p2p_lending" ? "Loan Book" : "AUM"} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="users" name="Users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Employee Count */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Employee Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.008 260)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.60 0.015 260)" }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Employees" radius={[4, 4, 0, 0]}>
                    {employeeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="bg-card border-border" id="benchmarking-table">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Side-by-Side Benchmarking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium sticky left-0 bg-card z-10">Company</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Revenue</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">EBITDA</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">PAT</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Valuation</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Funds Raised</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">{peerGroup === "p2p_lending" ? "Loan Book" : "AUM"}</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Users</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Employees</th>
                </tr>
              </thead>
              <tbody>
                {visibleCompanies.map((c, i) => {
                  const m = c.metrics || {};
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-3 font-medium sticky left-0 bg-card z-10">
                        <div className="flex items-center gap-2">
  <CompanyLogo displayName={c.displayName} size="sm" />
  {c.displayName}
</div>
                      </td>
                      <td className="text-right py-3 px-3 font-mono">{formatMetricValue(m.revenue?.value, m.revenue?.unit)}</td>
                      <td className="text-right py-3 px-3 font-mono">{formatMetricValue(m.ebitda?.value, m.ebitda?.unit)}</td>
                      <td className="text-right py-3 px-3 font-mono">{formatMetricValue(m.pat?.value, m.pat?.unit)}</td>
                      <td className="text-right py-3 px-3 font-mono">{formatMetricValue(m.valuation?.value, m.valuation?.unit)}</td>
                      <td className="text-right py-3 px-3 font-mono">{formatMetricValue(m.funds_raised?.value, m.funds_raised?.unit)}</td>
                      <td className="text-right py-3 px-3 font-mono">
                        {peerGroup === "p2p_lending"
                          ? formatMetricValue(m.loan_book?.value, m.loan_book?.unit)
                          : formatMetricValue(m.aum?.value, m.aum?.unit)}
                      </td>
                      <td className="text-right py-3 px-3 font-mono">{formatMetricValue(m.users?.value, "count")}</td>
                      <td className="text-right py-3 px-3 font-mono">{formatMetricValue(m.employee_count?.value, "count")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightsPanel({ peerGroup }: { peerGroup: "wealth_management" | "p2p_lending" }) {
  const { data: insights, isLoading } = trpc.insights.list.useQuery({ peerGroup });

  if (isLoading) return <div className="text-xs text-muted-foreground">Loading insights...</div>;
  if (!insights || insights.length === 0) {
    return (
      <Card className="bg-card border-border border-dashed">
        <CardContent className="py-6 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No insights generated yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Upload data and generate insights from the Admin Panel.</p>
        </CardContent>
      </Card>
    );
  }

  const insightIcons: Record<string, any> = {
    highest_revenue: DollarSign,
    most_funded: Wallet,
    fastest_growing: ArrowUpRight,
    weakest_profitability: TrendingDown,
    highest_valuation_revenue_ratio: Landmark,
    strongest_operating_leverage: Layers,
    market_leader: Building2,
    emerging_threat: TrendingUp,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {insights.map((insight) => {
        const Icon = insightIcons[insight.insightType] || Lightbulb;
        return (
          <Card key={insight.id} className="bg-card border-border hover:border-primary/20 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

const EXAMPLE_QUESTIONS = [
  "Which company has the highest revenue?",
  "Compare CRED vs IND Money revenue",
  "Which companies are loss-making?",
  "Who has the best EBITDA margin?",
  "Rank companies by AUM",
];

function AIQueryBox() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const askAI = trpc.ai.query.useMutation({
    onSuccess: (data) => {
      setHistory(prev => [...prev, { role: "assistant", content: data.answer }]);
    },
    onError: (err) => {
      setHistory(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    },
  });

  const handleSend = () => {
    const q = question.trim();
    if (!q || askAI.isPending) return;
    setHistory(prev => [...prev, { role: "user", content: q }]);
    setQuestion("");
    askAI.mutate({ question: q });
  };

  // Scroll to bottom on new messages
  useMemo(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, askAI.isPending]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-medium"
      >
        <MessageSquare className="h-4 w-4" /> Ask AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[560px] bg-card border border-border rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold">Financial Intelligence Q/A</span>
            <p className="text-[10px] text-muted-foreground">Ask about any company or comparison</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-secondary"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {history.length === 0 ? (
          <div className="py-4">
            <p className="text-xs text-muted-foreground text-center mb-3">Try asking:</p>
            <div className="space-y-1.5">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          ))
        )}
        {askAI.isPending && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Analysing…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask about revenue, margins, comparisons…"
            className="flex-1 bg-secondary border-border text-sm h-9"
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          />
          <Button
            size="sm"
            className="h-9 px-3"
            disabled={askAI.isPending || !question.trim()}
            onClick={handleSend}
          >
            {askAI.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("wealth_management");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "benchmarking">("cards");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const { data: wealthCompanies, isLoading: wealthLoading } = trpc.companies.getAllWithData.useQuery({ peerGroup: "wealth_management" });
  const { data: p2pCompanies, isLoading: p2pLoading } = trpc.companies.getAllWithData.useQuery({ peerGroup: "p2p_lending" });

  const currentCompanies = activeTab === "wealth_management" ? wealthCompanies : p2pCompanies;
  const isLoading = activeTab === "wealth_management" ? wealthLoading : p2pLoading;

  const allTags = useMemo(() => {
    if (!currentCompanies) return [];
    const tagSet = new Set<string>();
    currentCompanies.forEach(c => {
      (c.tags as string[] || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [currentCompanies]);

  const filteredCompanies = useMemo(() => {
    if (!currentCompanies) return [];
    let result = currentCompanies;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.displayName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.tags as string[] || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (activeTag) {
      result = result.filter(c => (c.tags as string[] || []).includes(activeTag));
    }
    return result;
  }, [currentCompanies, searchQuery, activeTag]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competitor Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indian Fintech Peer Group Analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-secondary border-border"
            />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === "cards" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("benchmarking")}
              className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === "benchmarking" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Benchmarking
            </button>
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              !activeTag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTag === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="wealth_management" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
            Wealth Management
          </TabsTrigger>
          <TabsTrigger value="p2p_lending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
            P2P Lending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wealth_management" className="mt-6">
          {wealthLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-6"><div className="h-48 bg-secondary rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "cards" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCompanies.map(c => (
                  <CompanyCard key={c.id} company={c} onClick={() => setLocation(`/company/${c.id}`)} />
                ))}
              </div>
              {filteredCompanies.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No companies found matching your search.</p>
                </div>
              )}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> AI-Generated Insights
                </h3>
                <InsightsPanel peerGroup="wealth_management" />
              </div>
            </>
          ) : (
            <BenchmarkingView companies={filteredCompanies} peerGroup="wealth_management" />
          )}
        </TabsContent>

        <TabsContent value="p2p_lending" className="mt-6">
          {p2pLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-6"><div className="h-48 bg-secondary rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "cards" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCompanies.map(c => (
                  <CompanyCard key={c.id} company={c} onClick={() => setLocation(`/company/${c.id}`)} />
                ))}
              </div>
              {filteredCompanies.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No companies found matching your search.</p>
                </div>
              )}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> AI-Generated Insights
                </h3>
                <InsightsPanel peerGroup="p2p_lending" />
              </div>
            </>
          ) : (
            <BenchmarkingView companies={filteredCompanies} peerGroup="p2p_lending" />
          )}
        </TabsContent>
      </Tabs>

      {/* AI Query Box */}
      <AIQueryBox />
    </div>
  );
}