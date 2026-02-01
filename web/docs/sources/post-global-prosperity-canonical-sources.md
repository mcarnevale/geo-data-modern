# Post Global Prosperity Dashboard (Peter Zeihan, US-first)
## Canonical tiles and data sources

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: Demographic support ratio (aging tailwind or headwind)
- Source: US Census Population Estimates (single year of age)
- What to pull: working-age share (e.g., 20–64) versus dependents; compute dependency ratios over time

### Tile C: Labor force capacity and participation
- Source: FRED / BLS CPS
- What to pull: labor force participation rate (CIVPART) and prime-age participation where available

### Tile D: Energy and commodity security (US position)
- Source: EIA (U.S. Energy Information Administration) API
- What to pull: crude oil production, net imports, petroleum consumption; optionally natural gas production

### Tile E: Supply chain exposure (trade concentration)
- Source: US Census International Trade API
- What to pull: import dependence by major partner and category; overall import share trends

### Tile F: Defense and geopolitical posture (US capability proxy)
- Source: SIPRI military expenditure dataset (US series) as external authoritative benchmark
- What to pull: US military expenditure over time (level and share of GDP where possible)

### Tile G: Food system resilience (optional, Zeihan-adjacent)
- Source: USDA Economic Research Service (ERS) data
- What to pull: farm sector indicators and/or food price series; use as narrative context rather than primary driver

## Implementation note
- This model leans into a small set of hard constraints: demographics, energy, trade, and security posture, with wealth distribution as the shared internal stability layer.
