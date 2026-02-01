# Capital in the 21st Century Dashboard (Thomas Piketty, US-first)
## Canonical tiles and data sources

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: r versus g (returns on capital versus growth)
Fixed source set:
- BEA Fixed Assets Accounts: rate of return series for private fixed assets (and related return measures)
- BEA National Income and Product Accounts: real GDP growth (can be pulled via FRED as GDPC1)

### Tile C: Capital share versus labor share of income
- Source: BEA National Income and Product Accounts (NIPA), national income by type
- What to compute: labor compensation share versus capital-type income share over time

### Tile D: Long-run top wealth shares (historic context)
- Source: World Inequality Database (WID)
- What to pull: US wealth share series for top 1%, top 10% (annual), as a long-run complement to DFA

### Tile E: Inheritance and intergenerational transfers proxy
- Source: Federal Reserve Survey of Consumer Finances (SCF) public microdata
- What to pull: variables related to gifts and inheritances, plus net worth and demographics

### Tile F: Asset composition by class (housing, equities, business, pensions)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: wealth component composition by percentile group over time

### Tile G: Policy and taxation backdrop (optional, narrative support)
- Source: IRS Statistics of Income (SOI), Historical Table 23 (top marginal income tax rate) or related SOI historical series
- What to pull: top marginal rates over time, plus selected aggregate tax measures where needed

## Implementation note
- DFA stays the canonical quarterly distribution backbone; WID provides longer historical context when we want pre-1989 coverage.
