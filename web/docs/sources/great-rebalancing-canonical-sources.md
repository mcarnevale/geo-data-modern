# The Great Rebalancing Dashboard (Michael Pettis, US-first)
## Canonical tiles and data sources

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: External balance and trade regime
- Source: BEA International Transactions (Balance of Payments) via FRED where available
- What to pull: Current account balance (as level and percent of GDP where possible)

### Tile C: Trade deficit composition (goods focus)
- Source: US Census International Trade API
- What to pull: exports, imports, and trade balance for goods over time; optionally by major end-use category

### Tile D: Savings and investment identity (the rebalancing core)
Fixed source set:
- BEA NIPA: Personal saving rate
- BEA NIPA: Gross saving and gross investment (or use FRED series where mirrored)
- BEA NIPA: Net exports contribution (or current account for the external mirror)

### Tile E: Manufacturing capacity and employment shift
- Source: BLS CES (manufacturing employment), mirrored in FRED as MANEMP
- What to pull: manufacturing employment level and share of total payroll employment

### Tile F: Distributional mechanism: wages versus profits
- Source: BEA NIPA
- What to pull: corporate profits and compensation of employees, and compute shares over time

### Tile G: Credit and consumption support
- Source: FRED
- What to pull:
  - Household debt service payments as percent of disposable income (TDSP)
  - Revolving consumer credit (REVOLSL) as consumption smoothing proxy

## Implementation note
- This model works best with a synchronized timeline and clear identity story: savings minus investment equals current account, while distribution affects consumption and external balances.
