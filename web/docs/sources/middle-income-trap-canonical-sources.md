# The Middle Income Trap Dashboard (US-first baseline)
## Canonical tiles and data sources

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: Wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: Growth regime and convergence pressure
- Source: BEA via FRED, Real GDP per capita (A939RX0Q048SBEA)
- What to pull: real GDP per capita level and growth rate (rolling 5- and 10-year)

### Tile C: Productivity slowdown
- Source: BLS Labor Productivity and Costs (nonfarm business), also available via FRED (OPHNFB)
- What to pull: labor productivity index and trend growth (rolling windows)

### Tile D: Investment and capital deepening
- Source: BEA via FRED, Gross Private Domestic Investment (GPDI)
- What to pull: investment level and investment share of GDP (compute GPDI divided by GDP)

### Tile E: Sectoral upgrading versus stagnation
- Source: BEA GDP by Industry (value added), with manufacturing value added mirrored in FRED (RVAMA)
- What to pull: manufacturing real value added trend and manufacturing share of total value added

### Tile F: Innovation intensity
Fixed source set:
- NSF NCSES Business Enterprise Research and Development (BERD): business R&D spending
- USPTO Open Data Portal bulk data: patent grants for counts per year (normalize per capita)

### Tile G: Trade balance and external constraint
- Source: US Census International Trade datasets (API) for exports and imports
- What to pull: trade balance trend (goods and, if desired, goods plus services where available)
