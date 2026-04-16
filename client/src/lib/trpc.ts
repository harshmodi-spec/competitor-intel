// Mock tRPC client — no server dependencies.
// Replaces @trpc/react-query with static hook functions that return mock data.

import { useCallback, useRef, useState } from "react";
import {
  ALL_COMPANIES,
  MOCK_COMPANIES_P2P,
  MOCK_COMPANIES_WM,
  MOCK_FILES,
  MOCK_INSIGHTS_P2P,
  MOCK_INSIGHTS_WM,
  MOCK_USER,
} from "./mockData";

// ─── Deep no-op proxy ────────────────────────────────────────────────────────
// Handles any chain like utils.companies.list.invalidate(), setData(), etc.

function deepNoop(): any {
  const fn = (..._args: any[]) => Promise.resolve(undefined);
  return new Proxy(fn, {
    get: () => deepNoop(),
    apply: () => Promise.resolve(undefined),
  });
}

// ─── Hook factories ──────────────────────────────────────────────────────────

function makeQuery<T>(getData: () => T) {
  return function useQuery(opts?: { enabled?: boolean }) {
    const enabled = opts?.enabled !== false;
    const data = enabled ? getData() : undefined;
    return {
      data,
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data }),
    };
  };
}

function makeParamQuery<TInput, T>(getData: (input: TInput) => T) {
  return function useQuery(input: TInput, opts?: { enabled?: boolean }) {
    const enabled = opts?.enabled !== false;
    const data = enabled ? getData(input) : undefined;
    return {
      data,
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data }),
    };
  };
}

type MutationHandlers<TData> = {
  onSuccess?: (data: TData) => void;
  onError?: (err: { message: string }) => void;
};

function makeMutation<TInput = any, TData = any>(
  mockFn: (input: TInput) => TData = () => ({} as TData),
  delayMs = 350
) {
  return function useMutation(handlers?: MutationHandlers<TData>) {
    const [isPending, setIsPending] = useState(false);
    const handlersRef = useRef<MutationHandlers<TData> | undefined>(handlers);
    handlersRef.current = handlers;

    const mutate = useCallback(
      (input?: TInput, localOpts?: { onSuccess?: (d: TData) => void }) => {
        setIsPending(true);
        setTimeout(() => {
          setIsPending(false);
          try {
            const result = mockFn(input as TInput);
            handlersRef.current?.onSuccess?.(result);
            localOpts?.onSuccess?.(result);
          } catch (err: any) {
            handlersRef.current?.onError?.({ message: String(err) });
          }
        }, delayMs);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const mutateAsync = useCallback(
      (input?: TInput): Promise<TData> =>
        new Promise((resolve, reject) => {
          setIsPending(true);
          setTimeout(() => {
            setIsPending(false);
            try {
              const result = mockFn(input as TInput);
              handlersRef.current?.onSuccess?.(result);
              resolve(result);
            } catch (err: any) {
              handlersRef.current?.onError?.({ message: String(err) });
              reject(err);
            }
          }, delayMs);
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return { mutate, mutateAsync, isPending, error: null };
  };
}

// ─── AI rule-based answering ─────────────────────────────────────────────────

function ruleBasedAnswer(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("highest revenue") || q.includes("most revenue") || q.includes("top revenue")) {
    return "**Zerodha** leads in revenue with **₹4,964 Cr** (FY2024), followed by **Angel One** (₹4,273 Cr) and **Groww** (₹3,145 Cr). In P2P lending, **LenDenClub** tops with ₹220 Cr.";
  }
  if (q.includes("loss") || q.includes("unprofitable") || q.includes("losses")) {
    return "Among wealth management companies, **CRED** (PAT: -₹609 Cr), **INDmoney** (-₹310 Cr), and **Paytm Money** (-₹145 Cr) are currently loss-making. All P2P lending companies in the peer group are profitable.";
  }
  if ((q.includes("compare") || q.includes("vs") || q.includes("versus")) && q.includes("revenue")) {
    return "**Revenue comparison (FY2024):**\n- Zerodha: ₹4,964 Cr\n- Angel One: ₹4,273 Cr\n- Groww: ₹3,145 Cr\n- CRED: ₹2,400 Cr\n- Upstox: ₹1,350 Cr\n- Paytm Money: ₹800 Cr\n- Smallcase: ₹350 Cr\n- INDmoney: ₹450 Cr\n- Kuvera: ₹180 Cr\n- 5paisa: ₹620 Cr";
  }
  if (q.includes("ebitda margin") || q.includes("best margin") || q.includes("highest margin")) {
    return "**Zerodha** has the best EBITDA margin at **58.6%** (₹2,907 Cr EBITDA on ₹4,964 Cr revenue). Smallcase follows at ~12.9% and Kuvera at ~12.2%. CRED (-22.9%) and INDmoney (-62.2%) have the worst margins.";
  }
  if (q.includes("aum") || q.includes("assets under management")) {
    return "**AUM comparison:**\n- Zerodha: ₹5,00,000 Cr\n- Groww: ₹1,20,000 Cr\n- Upstox: ₹50,000 Cr\n- Angel One: ₹80,000 Cr\n- Smallcase: ₹25,000 Cr\n- INDmoney: ₹20,000 Cr\n\nZerodha's AUM is significantly larger due to its institutional and HNI client base.";
  }
  if (q.includes("funded") || q.includes("funding") || q.includes("raised")) {
    return "**Total funding raised:**\n- CRED: ₹11,400 Cr (most funded)\n- Groww: ₹7,100 Cr\n- INDmoney: ₹3,800 Cr\n- Upstox: ₹2,200 Cr\n- Smallcase: ₹1,500 Cr\n- Kuvera: ₹1,050 Cr\n\nZerodha and 5paisa are bootstrapped/listed and have raised ₹0 through VC funding.";
  }
  if (q.includes("valuation")) {
    return "**Valuations:**\n- CRED: ₹70,000 Cr (highest)\n- Groww: ₹22,000 Cr\n- Zerodha: ₹25,000 Cr\n- Upstox: ₹14,000 Cr\n- INDmoney: ₹12,000 Cr\n- Kuvera: ₹4,200 Cr\n- Smallcase: ₹4,500 Cr";
  }
  if (q.includes("user") || q.includes("customer") || q.includes("clients")) {
    return "**User base comparison:**\n- Angel One: 2.2 Cr (largest)\n- Zerodha: 1.5 Cr\n- Upstox: 1.3 Cr\n- Groww: 1.1 Cr\n- CRED: 1.2 Cr\n- INDmoney: 1.2 Cr\n- Paytm Money: 50 L\n- Smallcase: 20 L";
  }
  if (q.includes("p2p") || q.includes("peer to peer") || q.includes("loan book")) {
    return "**P2P Lending peer group:**\n- LenDenClub: ₹3,200 Cr loan book (largest), ₹220 Cr revenue\n- Faircent: ₹2,500 Cr loan book, ₹180 Cr revenue\n- Lendbox: ₹1,800 Cr loan book, ₹120 Cr revenue\n- RupeeCircle: ₹1,200 Cr loan book, ₹80 Cr revenue\n\nAll four are profitable with Faircent leading on PAT margin (~10%).";
  }
  if (q.includes("employee") || q.includes("headcount") || q.includes("staff")) {
    return "**Employee counts:**\n- Angel One: 7,100 (largest team)\n- Groww: 3,800\n- Upstox: 2,500\n- CRED: 1,900\n- Zerodha: 1,100\n- 5paisa: 1,100\n- INDmoney: 750\n- Smallcase: 400\n\nZerodha leads on revenue per employee by a significant margin.";
  }
  if (q.includes("profitable") || q.includes("profit")) {
    return "**Profitable companies (FY2024):**\n✅ Zerodha (PAT: ₹2,907 Cr)\n✅ Angel One (₹1,134 Cr)\n✅ Groww (₹261 Cr)\n✅ Upstox (₹120 Cr)\n✅ 5paisa (₹55 Cr)\n✅ Kuvera (₹18 Cr)\n✅ Smallcase (₹38 Cr)\n\n❌ CRED (-₹609 Cr), INDmoney (-₹310 Cr), Paytm Money (-₹145 Cr) are still loss-making.";
  }

  return "I can answer questions about revenue, profitability, AUM, funding, valuation, user base, employees, and P2P loan books across the peer group. Try asking: *'Which company has the highest revenue?'* or *'Compare Groww vs Zerodha'* or *'Which companies are loss-making?'*";
}

// ─── The mock trpc object ────────────────────────────────────────────────────

export const trpc = {
  useUtils: () => deepNoop(),

  companies: {
    list: {
      useQuery: makeQuery(() =>
        ALL_COMPANIES.map((c) => ({
          id: c.id,
          name: c.name,
          displayName: c.displayName,
          peerGroup: c.peerGroup,
          category: c.category,
        }))
      ),
    },
    getAllWithData: {
      useQuery: makeParamQuery(
        (input: { peerGroup: string }) =>
          input.peerGroup === "p2p_lending" ? MOCK_COMPANIES_P2P : MOCK_COMPANIES_WM
      ),
    },
    getWithData: {
      useQuery: makeParamQuery(
        (input: { id: number }) =>
          ALL_COMPANIES.find((c) => c.id === input.id) ?? undefined
      ),
    },
    update: { useMutation: makeMutation() },
  },

  files: {
    forCompany: {
      useQuery: makeParamQuery((input: { companyId: number }) =>
        MOCK_FILES.filter((f) => f.companyId === input.companyId)
      ),
    },
    upload: { useMutation: makeMutation(() => ({ id: Date.now(), status: "parsed" })) },
  },

  news: {
    refresh: { useMutation: makeMutation() },
    refreshAll: { useMutation: makeMutation() },
  },

  insights: {
    list: {
      useQuery: makeParamQuery((input: { peerGroup: string }) =>
        input.peerGroup === "p2p_lending" ? MOCK_INSIGHTS_P2P : MOCK_INSIGHTS_WM
      ),
    },
    generate: { useMutation: makeMutation() },
  },

  metrics: {
    upsert: { useMutation: makeMutation() },
    forCompany: {
      useQuery: makeParamQuery((_input: { companyId: number }) => []),
    },
  },

  auth: {
    me: {
      useQuery: makeQuery(() => MOCK_USER),
    },
    logout: { useMutation: makeMutation() },
  },

  ai: {
    query: {
      useMutation: makeMutation((input: { question: string }) => ({
        answer: ruleBasedAnswer(input?.question ?? ""),
      })),
    },
  },
};
