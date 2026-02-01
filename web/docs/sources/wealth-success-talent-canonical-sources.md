# Wealth, Success & Talent Dashboard
## Canonical tiles and data sources (US-first)

Note: Tile A is the shared wealth distribution "spine" intended to appear across all models.

### Tile A: Wealth distribution spine (required)
- Source: Federal Reserve Distributional Financial Accounts (DFA)
- What to pull: Wealth shares by percentile group (top 1%, top 10%, etc.), quarterly

### Tile B: Who captures income at the top (income concentration)
- Source: IRS Statistics of Income (SOI), "Individual statistical tables by tax rate and income percentile"
- What to pull: Income and tax measures by income percentile (top 1%, top 5%, etc.), annual

### Tile C: Intergenerational mobility (success is inherited vs earned)
- Source: Opportunity Atlas (Opportunity Insights, in partnership with the U.S. Census Bureau)
- What to pull: Adult outcomes for children by parental income and childhood neighborhood (tract-level mobility statistics)

### Tile D: Education-to-earnings premium (talent signal meets labor market)
- Source: BLS "Education pays" (Current Population Survey)
- What to pull: Median earnings and unemployment rates by educational attainment, annual

### Tile E: Innovation output as a talent proxy
- Source: Opportunity Insights data library (patent rate datasets by neighborhood and demographics)
- What to pull: Patent rates (and related innovation indicators where available) sliced by place and background

### Tile F: Social capital and networks (who you know and who knows you)
- Source: Social Capital Atlas (Meta + Opportunity Insights + academic collaborators)
- What to pull: Economic connectedness and related social capital measures for U.S. geographies

## Optional engineering simplification
- Where available, FRED can be used as a unified ingestion pathway for some series.
