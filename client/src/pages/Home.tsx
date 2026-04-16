import { useEffect, useMemo, useState } from "react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, MessageSquare, Search, Send, Upload, Save } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { P2P_GROUP, WEALTH_GROUP, toCanonicalName } from "@/lib/companyNormalization";

type Company = {
  canonicalName: string;
  displayName: string;
  aliases: string[];
  metrics: {
    revenue?: number;
    profit?: number;
    ebitda?: number;
    aum?: number;
    users?: number;
    employees?: number;
  };
  peerGroups: Array<"wealth_management" | "p2p_lending">;
};

type ChatMessage = { role: "user" | "assistant"; content: string };
const API_BASE = "http://localhost:3000";

const num = (v?: number) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const inr = (v?: number) => (num(v) ? `₹${num(v).toLocaleString("en-IN")}` : "N/A");

function AIBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  const send = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer || "No answer." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Backend unavailable at http://localhost:3000." }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Q/A Engine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground">Try: top 3 by revenue, compare CRED vs IND Money, highest AUM.</p>
          ) : messages.map((msg, i) => (
            <div key={i} className={`rounded-lg p-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {msg.content}
            </div>
          ))}
          {asking && <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Thinking…</div>}
        </div>
        <div className="flex gap-2">
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask a question..." />
          <Button onClick={send} disabled={!question.trim() || asking}>{asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [peerView, setPeerView] = useState<"all" | "wealth_management" | "p2p_lending">("all");

  const [targetName, setTargetName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newAlias, setNewAlias] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/companies`);
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {
      setMessage("Failed to fetch companies from backend.");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const upload = async () => {
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      if (selectedFile) form.append("file", selectedFile);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      const data = await res.json();
      setMessage(res.ok ? `Loaded ${data.count} companies.` : data.error || "Upload failed.");
      await fetchCompanies();
    } catch {
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const saveDisplayName = async () => {
    if (!targetName.trim() || !newDisplayName.trim()) return;
    await fetch(`${API_BASE}/admin/company-name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canonicalName: toCanonicalName(targetName), displayName: newDisplayName }),
    });
    await fetchCompanies();
  };

  const saveAlias = async () => {
    if (!targetName.trim() || !newAlias.trim()) return;
    await fetch(`${API_BASE}/admin/alias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canonicalName: toCanonicalName(targetName), alias: newAlias }),
    });
    await fetchCompanies();
  };

  const strictPeerSet = useMemo(() => new Set([...WEALTH_GROUP, ...P2P_GROUP]), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      const hitQuery = !q || c.displayName.toLowerCase().includes(q) || c.canonicalName.toLowerCase().includes(q);
      const strictAllowed = strictPeerSet.has(c.canonicalName);
      if (peerView === "all") return hitQuery;
      return hitQuery && strictAllowed && c.peerGroups.includes(peerView);
    });
  }, [companies, query, peerView, strictPeerSet]);

  const benchmarkData = useMemo(() => filtered.map((c) => ({ name: c.displayName, Revenue: num(c.metrics.revenue), Profit: num(c.metrics.profit) })), [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competitor Intelligence Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real data from backend + robust Excel parsing.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          <Input type="file" accept=".xlsx,.xls" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="max-w-md" />
          <Button onClick={upload} disabled={uploading}>{uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />} Upload / Parse Sample.xlsx</Button>
          {message && <p className="text-xs text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Peer Group Filter</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant={peerView === "all" ? "default" : "outline"} onClick={() => setPeerView("all")}>All</Button>
            <Button variant={peerView === "wealth_management" ? "default" : "outline"} onClick={() => setPeerView("wealth_management")}>Wealth</Button>
            <Button variant={peerView === "p2p_lending" ? "default" : "outline"} onClick={() => setPeerView("p2p_lending")}>P2P</Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Admin Updates</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Input placeholder="Canonical company (e.g. CRED)" value={targetName} onChange={(e) => setTargetName(e.target.value)} />
              <Input placeholder="New display name" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} />
              <Button onClick={saveDisplayName} size="sm"><Save className="h-3 w-3 mr-2" />Save display name</Button>
            </div>
            <div className="space-y-2">
              <Input placeholder="Canonical company" value={targetName} onChange={(e) => setTargetName(e.target.value)} />
              <Input placeholder="New alias" value={newAlias} onChange={(e) => setNewAlias(e.target.value)} />
              <Button onClick={saveAlias} size="sm" variant="outline"><Save className="h-3 w-3 mr-2" />Add alias</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 w-72" placeholder="Search companies" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Comparison View (Revenue vs Profit)</CardTitle></CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Revenue" fill="#6366f1" />
              <Bar dataKey="Profit" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground"><Building2 className="h-10 w-10 mx-auto mb-2 opacity-40" />No companies found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Card key={c.canonicalName} className="hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <CompanyLogo displayName={c.displayName} size="md" />
                    <div>
                      <CardTitle className="text-base">{c.displayName}</CardTitle>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {c.peerGroups.map((group) => <Badge key={group} variant="outline">{group === "wealth_management" ? "Wealth" : "P2P"}</Badge>)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Revenue</p><p className="font-semibold">{inr(c.metrics.revenue)}</p></div>
                  <div><p className="text-muted-foreground">Profit</p><p className="font-semibold">{inr(c.metrics.profit)}</p></div>
                  <div><p className="text-muted-foreground">AUM</p><p className="font-semibold">{inr(c.metrics.aum)}</p></div>
                  <div><p className="text-muted-foreground">Users</p><p className="font-semibold">{num(c.metrics.users).toLocaleString("en-IN") || "N/A"}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Table View</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2">Company</th><th>Revenue</th><th>Profit</th><th>EBITDA</th><th>AUM</th><th>Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={`${c.canonicalName}-row`} className="border-b border-border/60">
                        <td className="py-2">
                          <div className="flex items-center gap-2"><CompanyLogo displayName={c.displayName} size="sm" /><span>{c.displayName}</span></div>
                        </td>
                        <td>{inr(c.metrics.revenue)}</td><td>{inr(c.metrics.profit)}</td><td>{inr(c.metrics.ebitda)}</td><td>{inr(c.metrics.aum)}</td><td>{num(c.metrics.users).toLocaleString("en-IN") || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AIBox />
    </div>
  );
}
