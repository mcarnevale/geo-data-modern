# The Great Leveler Dashboard (Walter Scheidel, US-first)
## Canonical tiles and data sources

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: Income inequality (longer run companion to wealth inequality)
- Source: World Inequality Database (WID)
- What to pull: top income shares (top 1%, top 10%), annual

### Tile C: Violence and war (the classic leveler)
- Source: UCDP Georeferenced Event Dataset (GED) or battle-related deaths series (US-focused cut via location)
- What to pull: conflict incidence and intensity over time (for US this may be sparse; use as contextual comparator)

### Tile D: Mass mobilization and political upheaval
- Source: ACLED (US protest and political violence events)
- What to pull: protest and violence event counts and intensity over time

### Tile E: Pandemic and mortality shock
- Source: CDC National Center for Health Statistics (NCHS), mortality and life expectancy series
- What to pull: all-cause mortality rates and life expectancy over time (and major shock periods)

### Tile F: State collapse / fiscal crisis proxy
- Source: US Treasury Fiscal Data API
- What to pull: deficit, debt, and interest outlays or debt servicing indicators over time

### Tile G: Destruction and rebuilding mechanism (asset price resets)
- Source: Shiller U.S. Stock Market and Home Price data via FRED where available
- What to pull: real home prices and real equity index proxies to show reset periods and recoveries

## Implementation note
- Scheidel's four levelers (mass mobilization war, revolution, state collapse, lethal pandemics) can be represented as "shock overlays" aligned to inequality series to tell a causal narrative without overstating precision.
