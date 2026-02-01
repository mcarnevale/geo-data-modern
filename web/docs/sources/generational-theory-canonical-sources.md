# Generational Theory Dashboard
## Canonical tiles and data sources (US-first)

Note: Tile A is the wealth distribution "spine" intended to be shared across models whenever possible.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: Wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: Wealth by cohort over the life cycle
- Source: Federal Reserve Survey of Consumer Finances (SCF) public microdata
- What to pull: Household net worth with age and other demographics to construct birth-cohort trajectories (triennial)

### Tile C: Coming-of-age conditions index (ages 18 to 25)
Fixed source set:
- BLS Current Population Survey (CPS): unemployment and earnings by age
- BLS CPI-U: inflation adjustment
- FHFA House Price Index (HPI): home price pressure
- US Census ACS API, table B25070: rent burden
- NY Fed Household Debt and Credit (HHDC): student loan balances and related stress measures

### Tile D: Intergenerational balance sheet (assets and debts by age)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: balance sheet levels and composition by age groups (assets, liabilities)

### Tile E: Institutional trust and polarization by cohort
- Source: General Social Survey (GSS)
- What to pull: confidence in institutions and social trust measures, with respondent age for cohort construction

### Tile F: Turning timeline overlay
- Source: Curated model metadata
- What to store: turning ranges (High, Awakening, Unraveling, Crisis) as editorial annotations

### Tile G: Crisis and mobilization pressure
- Source: GDELT Events database
- What to pull: event volume measures aligned to categories relevant to protest, conflict, or instability over time

### Tile H: Generational size and dependency ratios
- Source: US Census Population Estimates (single year of age)
- What to pull: population by single year of age over time for cohort sizing and dependency ratios

## Optional engineering simplification
- Where available, FRED API can be used as a unified ingestion pathway for some series.
