# The Economic Machine Dashboard (Ray Dalio, US-first)
## Canonical tiles and data sources

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: Wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: Debt in the economy (total and by sector)
- Source: Federal Reserve Financial Accounts of the United States (Z.1) via FRED
- What to pull:
  - Total credit market debt outstanding (TCMDO)
  - Household debt (CMDEBT)
  - Nonfinancial corporate debt (NCBDBIQ027S)
  - Federal government debt (FYGFDPUN)

### Tile C: Credit growth versus real growth
- Source: FRED (constructed from series)
- What to pull:
  - Real GDP (GDPC1)
  - Total credit market debt outstanding (TCMDO)
- What to compute: YoY growth and a "credit impulse" proxy (change in debt growth rate)

### Tile D: Interest rates and the cost of money
- Source: FRED
- What to pull:
  - Effective Federal Funds Rate (EFFR)
  - 10-Year Treasury Constant Maturity Rate (DGS10)
  - 2-Year Treasury Constant Maturity Rate (DGS2)

### Tile E: Inflation versus policy
- Source: FRED
- What to pull:
  - CPI-U (CPIAUCSL) or PCE price index (PCEPI)
  - Effective Federal Funds Rate (EFFR)

### Tile F: Labor slack and recession dynamics
- Source: FRED
- What to pull:
  - Unemployment rate (UNRATE)
  - Employment level (PAYEMS) or labor force participation (CIVPART)
  - NBER recession indicator (USREC)

### Tile G: Deleveraging conditions
- Source: FRED
- What to pull:
  - Federal debt held by the public or total federal debt (FYGFDPUN)
  - CPI-U (CPIAUCSL)
  - Real GDP (GDPC1)
  - Interest expense proxy if desired (FYOIGDA188S)

### Tile H: Money and liquidity (optional but very Dalio)
- Source: FRED
- What to pull:
  - M2 money stock (M2SL)
  - Bank credit (TOTBKCR) or commercial and industrial loans (BUSLOANS)

## Implementation note
- This model is well suited to a single ingestion path using FRED for most series, with DFA as the shared wealth distribution spine.
