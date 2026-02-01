# End Times Dashboard (Structural-Demographic Theory, US-first)
## Canonical tiles and data sources

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: Wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: Popular immiseration index
Fixed source set:
- US Census Bureau, Historical Income Tables (Households): real median household income, annual
- BLS Current Employment Statistics (CES): nominal earnings series, paired with CPI to compute real earnings
- CDC NVSS Life Expectancy: life expectancy time series as a broad health and wellbeing proxy

### Tile C: Elite overproduction index
Fixed source set:
- NCES IPEDS: degree completions (especially graduate and professional degrees) as an elite credential supply proxy
- NCES IPEDS (institution profile for Yale, UnitID 130794): tuition and fees to proxy intra-elite competition for elite education

### Tile D: State fiscal distress
- Source: US Treasury Fiscal Data API
- What to pull: federal deficit and total debt series (and optionally interest expense), consistent time series

### Tile E: Elite conflict and polarization
- Source: Voteview (DW-NOMINATE and polarization series)
- What to pull: party mean DW-NOMINATE polarization trend over time

### Tile F: Instability and unrest events
- Source: ACLED (US political violence and protest events)
- What to pull: event counts and intensities over time, plus geography for mapping

## Optional engineering simplification
- Where relevant series exist in FRED, FRED can be used as a unified ingestion pathway, but Treasury Fiscal Data is the canonical source for federal fiscal metrics in this model.
