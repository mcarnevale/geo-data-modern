/**
 * Tile registry for the 9 prototype models.
 * Source of truth: /docs/sources canonical markdown files.
 */

export type PrototypeModelId =
  | "generational-theory"
  | "wealth-success-talent"
  | "end-times"
  | "middle-income-trap"
  | "economic-machine"
  | "capital-21st-century"
  | "great-rebalancing"
  | "great-leveler"
  | "post-global-prosperity";

export interface TileDefSource {
  provider: string;
  dataset?: string;
  access?: string;
  notes?: string;
  /** Optional URL to open source data in a new window (e.g. FRED series page). */
  url?: string;
}

export interface TileDefFetch {
  kind: string;
  params?: Record<string, unknown>;
}

/** Params for fetch.kind === "fred-multi": multiple FRED series, aligned by date. */
export interface FredMultiParams {
  series: { id: string; label: string }[];
}

export interface TileDef {
  tileId: string;
  label: string;
  description: string;
  source: TileDefSource;
  fetch: TileDefFetch;
}

export interface RegistryModel {
  id: PrototypeModelId;
  name: string;
  description: string;
  tiles: TileDef[];
}

const DFA_WEALTH_SPINE: TileDef = {
  tileId: "wealth-distribution",
  label: "Wealth Distribution",
  description: "Wealth shares by percentile group (top 1%, top 10%, etc.), quarterly.",
  source: {
    provider: "Federal Reserve Distributional Financial Accounts (DFA)",
    access: "FRED",
    notes: "from 1989",
  },
  fetch: { kind: "wealth-distribution", params: {} },
};

export const prototypeModels: RegistryModel[] = [
  {
    id: "generational-theory",
    name: "Generational Theory",
    description: "Explores how generational cycles shape economic and social outcomes.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "wealth-by-cohort-life-cycle",
        label: "Wealth by cohort over the life cycle",
        description: "Household net worth with age and demographics for birth-cohort trajectories (triennial).",
        source: { provider: "Federal Reserve Survey of Consumer Finances (SCF)", access: "public microdata" },
        fetch: { kind: "scf-wealth-by-cohort", params: {} },
      },
      {
        tileId: "coming-of-age-conditions-index",
        label: "Coming-of-age conditions index (ages 18–25)",
        description: "BLS CPS (unemployment, earnings), CPI-U, FHFA HPI, Census ACS rent burden, NY Fed HHDC student debt.",
        source: {
          provider: "BLS CPS, BLS CPI-U, FHFA HPI, US Census ACS, NY Fed HHDC",
          access: "multiple",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "LNS14024887", label: "Youth unemp (16-24) %" },
              { id: "LEU0252887100Q", label: "Median earn 20-24 ($/wk)" },
              { id: "CPIAUCSL", label: "CPI-U" },
              { id: "USSTHPI", label: "FHFA house price index" },
            ],
          },
        },
      },
      {
        tileId: "intergenerational-balance-sheet",
        label: "Intergenerational balance sheet",
        description: "Balance sheet levels and composition by age groups (assets, liabilities).",
        source: { provider: "Federal Reserve Distributional Financial Accounts (DFA)" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "WFRBLB50107", label: "Net worth bottom 50%" },
              { id: "WFRBLN40080", label: "Net worth 50-90%" },
              { id: "WFRBLN09053", label: "Net worth 90-99%" },
              { id: "WFRBLT01026", label: "Net worth top 1%" },
            ],
          },
        },
      },
      {
        tileId: "institutional-trust-polarization-cohort",
        label: "Institutional trust and polarization by cohort",
        description: "Confidence in institutions and social trust, with respondent age for cohort construction.",
        source: { provider: "General Social Survey (GSS)" },
        fetch: { kind: "gss-institutional-trust", params: {} },
      },
      {
        tileId: "turning-timeline-overlay",
        label: "Turning timeline overlay",
        description: "Turning ranges (High, Awakening, Unraveling, Crisis) as editorial annotations.",
        source: { provider: "Curated model metadata" },
        fetch: { kind: "turning-timeline-overlay", params: {} },
      },
      {
        tileId: "crisis-mobilization-pressure",
        label: "Crisis and mobilization pressure",
        description: "Event volume measures for protest, conflict, or instability over time.",
        source: { provider: "GDELT Events database" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "USEPUINDXD", label: "Economic policy uncertainty" },
              { id: "USREC", label: "NBER recession" },
            ],
          },
        },
      },
      {
        tileId: "generational-size-dependency-ratios",
        label: "Generational size and dependency ratios",
        description: "Working-age share and old-age dependency ratio (65+ per 100 working-age).",
        source: { provider: "World Bank via FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "SPPOP1564TOZSUSA", label: "Working-age (15–64) % of pop" },
              { id: "SPPOPDPNDOLUSA", label: "Old-age dependency (65+ per 100 WA)" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "wealth-success-talent",
    name: "Wealth, Success & Talent",
    description: "Examines the relationship between wealth accumulation, success metrics, and talent distribution.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "income-concentration-top",
        label: "Who captures income at the top",
        description: "Income concentration: Gini ratio for households (higher = more at top).",
        source: { provider: "Census Bureau via FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "GINIALLRH", label: "Income Gini (households)" }],
          },
        },
      },
      {
        tileId: "intergenerational-mobility",
        label: "Intergenerational mobility",
        description: "Absolute mobility: % of children earning more than parents (by birth cohort; year = cohort age 30).",
        source: {
          provider: "Opportunity Insights (Chetty et al.)",
          url: "https://opportunityinsights.org/paper/the-fading-american-dream/",
        },
        fetch: { kind: "absolute-mobility", params: {} },
      },
      {
        tileId: "education-earnings-premium",
        label: "Education-to-earnings premium",
        description: "Median earnings and unemployment rates by educational attainment, annual.",
        source: { provider: "BLS Current Population Survey", dataset: "Education pays" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "LEU0252881600Q", label: "Median weekly earnings" },
              { id: "LNS14027662", label: "Unemp rate: bachelor's+" },
            ],
          },
        },
      },
      {
        tileId: "innovation-output-talent-proxy",
        label: "Innovation output as a talent proxy",
        description: "U.S. patents granted (total and utility) by year; proxy for innovation output.",
        source: {
          provider: "U.S. Patent and Trademark Office via FRED",
          url: "https://fred.stlouisfed.org/series/PATENTUSALLTOTAL",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "PATENTUSALLTOTAL", label: "Patents granted (total)" },
              { id: "PATENTUSALLUTILITY", label: "Utility patents" },
            ],
          },
        },
      },
      {
        tileId: "social-capital-networks",
        label: "Social capital and networks",
        description: "Social trust and confidence in institutions over time (GSS). Economic connectedness by place: Social Capital Atlas.",
        source: {
          provider: "GSS (NORC) / Social Capital Atlas",
          url: "https://gssdataexplorer.norc.org/",
        },
        fetch: { kind: "gss-institutional-trust", params: {} },
      },
    ],
  },
  {
    id: "end-times",
    name: "End Times",
    description: "Structural-demographic theory; long-term and tail-risk economic narratives.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "popular-immiseration-index",
        label: "Popular immiseration index",
        description: "Real median household income, real earnings, life expectancy as wellbeing proxy.",
        source: {
          provider: "US Census Historical Income, BLS CES, CDC NVSS Life Expectancy",
          access: "multiple",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "MEHOINUSA672N", label: "Real median household income" },
              { id: "UNRATE", label: "Unemployment %" },
            ],
          },
        },
      },
      {
        tileId: "elite-overproduction-index",
        label: "Elite overproduction index",
        description: "Tuition CPI and employment (bachelor's+) as proxies for elite credential supply and competition.",
        source: {
          provider: "BLS via FRED / NCES IPEDS",
          url: "https://fred.stlouisfed.org/series/CUSR0000SEEB",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "CUSR0000SEEB", label: "CPI: tuition & school fees (1982–84=100)" },
              { id: "LNS12027662", label: "Employed, bachelor's+ (thous.)" },
            ],
          },
        },
      },
      {
        tileId: "state-fiscal-distress",
        label: "State fiscal distress",
        description: "Federal deficit, total debt, and optionally interest expense over time.",
        source: { provider: "US Treasury Fiscal Data API" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "FYGFDPUN", label: "Federal debt" },
              { id: "FYFSD", label: "Federal surplus/deficit" },
            ],
          },
        },
      },
      {
        tileId: "elite-conflict-polarization",
        label: "Elite conflict and polarization",
        description: "Congressional party polarization (DW-NOMINATE distance) over time.",
        source: {
          provider: "Voteview (Lewis et al.)",
          url: "https://voteview.com/articles/party_polarization",
        },
        fetch: { kind: "polarization", params: {} },
      },
      {
        tileId: "instability-unrest-events",
        label: "Instability and unrest events",
        description: "Annual count of US political unrest events (demonstrations, protests, political violence).",
        source: {
          provider: "ACLED (Armed Conflict Location & Event Data Project)",
          url: "https://acleddata.com/united-states-and-canada/usa/",
        },
        fetch: { kind: "unrest", params: {} },
      },
    ],
  },
  {
    id: "middle-income-trap",
    name: "The Middle Income Trap",
    description: "Analyzes why some economies stall after reaching middle-income status.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "growth-regime-convergence-pressure",
        label: "Growth regime and convergence pressure",
        description: "Real GDP per capita level and growth rate (rolling 5- and 10-year).",
        source: { provider: "BEA via FRED", dataset: "Real GDP per capita (A939RX0Q048SBEA)" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "A939RX0Q048SBEA", label: "Real GDP per capita" }],
          },
        },
      },
      {
        tileId: "productivity-slowdown",
        label: "Productivity slowdown",
        description: "Labor productivity index and trend growth (rolling windows).",
        source: { provider: "BLS Labor Productivity and Costs", access: "FRED OPHNFB" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "OPHNFB", label: "Output per hour (nonfarm)" }],
          },
        },
      },
      {
        tileId: "investment-capital-deepening",
        label: "Investment and capital deepening",
        description: "Investment level and investment share of GDP (GPDI / GDP).",
        source: { provider: "BEA via FRED", dataset: "Gross Private Domestic Investment (GPDI)" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "GPDI", label: "GPDI" },
              { id: "GDP", label: "GDP" },
            ],
          },
        },
      },
      {
        tileId: "sectoral-upgrading-stagnation",
        label: "Sectoral upgrading versus stagnation",
        description: "Manufacturing real value added trend and manufacturing share of total value added.",
        source: { provider: "BEA GDP by Industry", dataset: "FRED RVAMA" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "RVAMA", label: "Real value added: manufacturing" }],
          },
        },
      },
      {
        tileId: "innovation-intensity",
        label: "Innovation intensity",
        description: "Business R&D spending and patent grants per year.",
        source: {
          provider: "BEA / USPTO via FRED",
          url: "https://fred.stlouisfed.org/series/Y694RC1Q027SBEA",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "Y694RC1Q027SBEA", label: "R&D spending (GDP component)" },
              { id: "PATENTUSALLTOTAL", label: "US patent grants" },
            ],
          },
        },
      },
      {
        tileId: "trade-balance-external-constraint",
        label: "Trade balance and external constraint",
        description: "Trade balance trend (goods and optionally goods plus services).",
        source: { provider: "US Census International Trade API" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "NETEXP", label: "Net exports" },
              { id: "BOPGSTB", label: "Trade balance" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "economic-machine",
    name: "The Economic Machine",
    description: "Ray Dalio; simplified view of how the economy operates as a system.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "debt-economy-by-sector",
        label: "Debt in the economy",
        description: "Total credit market debt (TCMDO), household (CMDEBT), corporate (NCBDBIQ027S), federal (FYGFDPUN).",
        source: { provider: "Federal Reserve Financial Accounts (Z.1) via FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "TCMDO", label: "Total credit" },
              { id: "CMDEBT", label: "Household" },
              { id: "NCBDBIQ027S", label: "Corporate" },
              { id: "FYGFDPUN", label: "Federal" },
            ],
          },
        },
      },
      {
        tileId: "credit-growth-vs-real-growth",
        label: "Credit growth versus real growth",
        description: "Real GDP (GDPC1), TCMDO; YoY growth and credit impulse proxy.",
        source: { provider: "FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "GDPC1", label: "Real GDP" },
              { id: "TCMDO", label: "Total credit" },
            ],
          },
        },
      },
      {
        tileId: "interest-rates-cost-of-money",
        label: "Interest rates and the cost of money",
        description: "Effective Fed Funds (EFFR), 10-Year (DGS10), 2-Year (DGS2) Treasury rates.",
        source: { provider: "FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "DGS10", label: "10Y Treasury" },
              { id: "DGS2", label: "2Y Treasury" },
              { id: "FEDFUNDS", label: "Fed Funds" },
            ],
          },
        },
      },
      {
        tileId: "inflation-vs-policy",
        label: "Inflation versus policy",
        description: "CPI-U (CPIAUCSL) or PCE (PCEPI), Effective Federal Funds Rate.",
        source: { provider: "FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "CPIAUCSL", label: "CPI-U" },
              { id: "FEDFUNDS", label: "Fed Funds" },
            ],
          },
        },
      },
      {
        tileId: "labor-slack-recession-dynamics",
        label: "Labor slack and recession dynamics",
        description: "Unemployment (UNRATE), employment (PAYEMS) or participation (CIVPART), NBER recession (USREC).",
        source: { provider: "FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "UNRATE", label: "Unemployment %" },
              { id: "PAYEMS", label: "Payrolls" },
              { id: "USREC", label: "NBER recession" },
            ],
          },
        },
      },
      {
        tileId: "deleveraging-conditions",
        label: "Deleveraging conditions",
        description: "Federal debt (FYGFDPUN), CPI-U, Real GDP, interest expense proxy (FYOIGDA188S).",
        source: { provider: "FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "FYGFDPUN", label: "Federal debt" },
              { id: "GDPC1", label: "Real GDP" },
              { id: "FYOIGDA188S", label: "Interest expense" },
            ],
          },
        },
      },
      {
        tileId: "money-liquidity",
        label: "Money and liquidity",
        description: "M2 (M2SL), bank credit (TOTBKCR) or C&I loans (BUSLOANS).",
        source: { provider: "FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "M2SL", label: "M2" },
              { id: "TOTBKCR", label: "Bank credit" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "capital-21st-century",
    name: "Capital in the 21st Century",
    description: "Thomas Piketty; inequality and capital concentration themes.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "r-versus-g",
        label: "r versus g",
        description: "Rate of return on private fixed assets; real GDP growth (FRED GDPC1).",
        source: { provider: "BEA Fixed Assets, BEA NIPA / FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "GDPC1", label: "Real GDP" },
              { id: "A191RL1Q225SBEA", label: "Real GDP growth %" },
            ],
          },
        },
      },
      {
        tileId: "capital-share-vs-labor-share",
        label: "Capital share versus labor share of income",
        description: "Labor compensation share versus capital-type income share over time.",
        source: { provider: "BEA National Income and Product Accounts (NIPA)" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "COE", label: "Compensation of employees" },
              { id: "CP", label: "Corporate profits" },
            ],
          },
        },
      },
      {
        tileId: "long-run-top-wealth-shares",
        label: "Long-run top wealth shares",
        description: "US wealth share top 1%, top 10% (quarterly), long-run complement to DFA.",
        source: {
          provider: "Federal Reserve Distributional Financial Accounts (DFA)",
          access: "FRED",
          notes: "top 10% = top 1% + 90–99%",
        },
        fetch: { kind: "long-run-top-wealth-shares", params: {} },
      },
      {
        tileId: "inheritance-intergenerational-transfers",
        label: "Inheritance and intergenerational transfers proxy",
        description: "Gifts, inheritances, net worth, and demographics from SCF.",
        source: { provider: "Federal Reserve Survey of Consumer Finances (SCF)" },
        fetch: { kind: "stub", params: {} },
      },
      {
        tileId: "asset-composition-by-class",
        label: "Asset composition by class",
        description: "Wealth component composition (housing, equities, business, pensions) by percentile over time.",
        source: { provider: "Federal Reserve Distributional Financial Accounts (DFA)" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "WFRBST01110", label: "Top 1% share: real estate" },
              { id: "WFRBST01122", label: "Top 1% share: equities" },
            ],
          },
        },
      },
      {
        tileId: "policy-taxation-backdrop",
        label: "Policy and taxation backdrop",
        description: "Top marginal income tax rate (IRS SOI) and federal tax receipts.",
        source: {
          provider: "IRS SOI / Treasury via FRED",
          url: "https://fred.stlouisfed.org/series/IITTRHB",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "IITTRHB", label: "Top marginal income tax rate" },
              { id: "W006RCQ027SBEA", label: "Govt current tax receipts" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "great-rebalancing",
    name: "The Great Rebalancing",
    description: "Michael Pettis; global rebalancing and shift narratives.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "external-balance-trade-regime",
        label: "External balance and trade regime",
        description: "Current account balance (level and percent of GDP).",
        source: { provider: "BEA International Transactions via FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "BOPBCA", label: "Current account" }],
          },
        },
      },
      {
        tileId: "trade-deficit-composition",
        label: "Trade deficit composition (goods focus)",
        description: "Exports, imports, trade balance for goods; optionally by end-use category.",
        source: { provider: "US Census International Trade API" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "NETEXP", label: "Net exports" },
              { id: "IMPGS", label: "Imports" },
              { id: "EXPGS", label: "Exports" },
            ],
          },
        },
      },
      {
        tileId: "savings-investment-identity",
        label: "Savings and investment identity",
        description: "Personal saving rate, gross saving/investment, net exports contribution.",
        source: { provider: "BEA NIPA" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "PSAVERT", label: "Personal saving rate %" },
              { id: "GPDI", label: "Gross private investment" },
              { id: "NETEXP", label: "Net exports" },
            ],
          },
        },
      },
      {
        tileId: "manufacturing-capacity-employment",
        label: "Manufacturing capacity and employment shift",
        description: "Manufacturing employment level and share of total payroll (FRED MANEMP).",
        source: { provider: "BLS CES / FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "MANEMP", label: "Manufacturing employment" }],
          },
        },
      },
      {
        tileId: "distributional-wages-vs-profits",
        label: "Distributional mechanism: wages versus profits",
        description: "Corporate profits and compensation of employees; shares over time.",
        source: { provider: "BEA NIPA" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "COE", label: "Compensation" },
              { id: "CP", label: "Corporate profits" },
            ],
          },
        },
      },
      {
        tileId: "credit-consumption-support",
        label: "Credit and consumption support",
        description: "Household debt service as % of disposable income (TDSP), revolving consumer credit (REVOLSL).",
        source: { provider: "FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "TDSP", label: "Debt service %" },
              { id: "REVOLSL", label: "Revolving credit" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "great-leveler",
    name: "The Great Leveler",
    description: "Walter Scheidel; inequality and leveling forces over history.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "income-inequality-long-run",
        label: "Income inequality (longer run)",
        description: "Top income shares (top 1%, top 10%), annual.",
        source: { provider: "World Inequality Database (WID)" },
        fetch: { kind: "stub", params: {} },
      },
      {
        tileId: "violence-and-war",
        label: "Violence and war",
        description: "Global battle-related deaths (UCDP); conflict intensity as contextual leveler.",
        source: {
          provider: "UCDP (Uppsala Conflict Data Program)",
          url: "https://ucdp.uu.se/downloads/",
        },
        fetch: { kind: "violence-war", params: {} },
      },
      {
        tileId: "mass-mobilization-political-upheaval",
        label: "Mass mobilization and political upheaval",
        description: "US protest and political violence event counts and intensity over time.",
        source: { provider: "ACLED (Armed Conflict Location & Event Data Project)" },
        fetch: { kind: "unrest", params: {} },
      },
      {
        tileId: "pandemic-mortality-shock",
        label: "Pandemic and mortality shock",
        description: "All-cause mortality rates and life expectancy; major shock periods.",
        source: {
          provider: "World Bank via FRED",
          access: "CDC/NCHS-aligned life expectancy series",
          notes: "SPDYNLE00INUSA; COVID drop visible 2020–2021",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "SPDYNLE00INUSA", label: "Life expectancy (years)" }],
          },
        },
      },
      {
        tileId: "state-collapse-fiscal-crisis",
        label: "State collapse / fiscal crisis proxy",
        description: "Deficit, debt, interest outlays or debt servicing over time.",
        source: { provider: "US Treasury Fiscal Data API" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "FYGFDPUN", label: "Federal debt" },
              { id: "FYOIGDA188S", label: "Interest expense" },
            ],
          },
        },
      },
      {
        tileId: "destruction-rebuilding-asset-resets",
        label: "Destruction and rebuilding mechanism",
        description: "Real home prices and real equity index proxies for reset periods and recoveries.",
        source: { provider: "Shiller U.S. Stock Market and Home Price data via FRED" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "CSUSHPINSA", label: "Case-Shiller home price" },
              { id: "SP500", label: "S&P 500" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "post-global-prosperity",
    name: "Post Global Prosperity",
    description: "Peter Zeihan; post-globalization prosperity and distribution.",
    tiles: [
      DFA_WEALTH_SPINE,
      {
        tileId: "demographic-support-ratio",
        label: "Demographic support ratio",
        description: "Working-age share (20–64) versus dependents; dependency ratios over time.",
        source: { provider: "US Census Population Estimates (single year of age)" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "LFWA64TTUSA647N", label: "Working age pop 15-64" },
              { id: "CIVPART", label: "Labor force participation %" },
            ],
          },
        },
      },
      {
        tileId: "labor-force-capacity-participation",
        label: "Labor force capacity and participation",
        description: "Labor force participation (CIVPART), prime-age participation.",
        source: { provider: "FRED / BLS CPS" },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "CIVPART", label: "Participation %" }],
          },
        },
      },
      {
        tileId: "energy-commodity-security",
        label: "Energy and commodity security (US position)",
        description: "US crude oil and natural gas production indices (2017=100).",
        source: {
          provider: "Federal Reserve G.17 Industrial Production via FRED",
          access: "EIA-aligned production indices",
          notes: "Petroleum import volume not on FRED; production tracks energy security",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "IPG21112S", label: "Crude oil production (index)" },
              { id: "IPG21113S", label: "Natural gas & NGL production (index)" },
            ],
          },
        },
      },
      {
        tileId: "supply-chain-exposure",
        label: "Supply chain exposure (trade concentration)",
        description: "Import share of GDP (goods and services); proxy for import dependence.",
        source: {
          provider: "BEA National Income and Product Accounts via FRED",
          access: "Shares of GDP",
          notes: "B021RE1Q156NBEA; partner/category detail via Census API",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "B021RE1Q156NBEA", label: "Imports share of GDP (%)" }],
          },
        },
      },
      {
        tileId: "defense-geopolitical-posture",
        label: "Defense and geopolitical posture",
        description: "US military expenditure over time (share of GDP).",
        source: {
          provider: "BEA National Income and Product Accounts via FRED",
          access: "Shares of GDP",
          notes: "A824RE1Q156NBEA; aligned with SIPRI methodology",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [{ id: "A824RE1Q156NBEA", label: "Defense share of GDP (%)" }],
          },
        },
      },
      {
        tileId: "food-system-resilience",
        label: "Food system resilience",
        description: "Farm sector indicators and/or food price series; narrative context.",
        source: {
          provider: "BLS Producer Price Index via FRED",
          access: "PPI farm products and all foods",
          notes: "1982=100; USDA ERS-aligned proxy",
        },
        fetch: {
          kind: "fred-multi",
          params: {
            series: [
              { id: "WPU01", label: "Farm products PPI (index)" },
              { id: "WPUSI013011", label: "All foods PPI (index)" },
            ],
          },
        },
      },
    ],
  },
];

/** Look up a tile definition by tileId across all prototype models. */
export function getTileByTileId(tileId: string): TileDef | undefined {
  for (const model of prototypeModels) {
    const tile = model.tiles.find((t) => t.tileId === tileId);
    if (tile) return tile;
  }
  return undefined;
}

/** URL to open source data in a new window (FRED series, Census, etc.). */
export function getSourceUrl(tile: TileDef): string | undefined {
  if (tile.source.url) return tile.source.url;
  if (tile.fetch.kind === "fred-multi" && tile.fetch.params) {
    const series = (tile.fetch.params as { series?: { id: string }[] }).series;
    if (series?.[0]?.id) return `https://fred.stlouisfed.org/series/${series[0].id}`;
  }
  if (tile.fetch.kind === "wealth-distribution") {
    return "https://fred.stlouisfed.org/series/WFRBST01108";
  }
  return undefined;
}
