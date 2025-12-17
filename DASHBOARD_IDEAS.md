# Dashboard Ideas - Argentine Insurance Market

Future dashboard concepts for the visualization project. Each idea includes the **unit of observation** (what entity/level the dashboard focuses on).

---

## Current Implementation

| Dashboard | Unit of Observation | Status |
|-----------|---------------------|--------|
| Market Overview | All market / filtered by ramo | Completed |

---

## Proposed Dashboards

### 1. Company Deep-Dive ("Perfil de Aseguradora")

**Unit of Observation:** Single company

**Description:** Detailed view of one company's performance and health over time.

**Key Sections:**
- Company Scorecard: All KPIs for selected company vs market average
- Historical Performance: Evolution of primas, siniestros, gastos over last 8-12 quarters
- Juicios Trend: Count of juicios over time for this company
- Ramo Mix: How the company's portfolio is distributed across ramos/subramos
- Expense Structure: Gastos breakdown as percentage of primas
- Trend Indicators: Arrows or sparklines showing growth/decline in key metrics
- Risk Alerts: Visual flags when siniestralidad or expense ratios exceed thresholds

**Data Requirements:**
- Existing primas/siniestros/gastos data
- Juicios count (available at company level)

---

### 2. Peer Comparison ("Comparador de Aseguradoras")

**Unit of Observation:** 2-5 selected companies

**Description:** Side-by-side comparison of selected insurers.

**Key Sections:**
- Radar Chart: Multi-dimensional comparison (size, growth, siniestralidad, efficiency, diversification)
- Parallel Metrics Table: Same metrics for each company in columns
- Market Share Evolution: Line chart showing how each company's share changed over time
- Ratio Comparison Bars: Horizontal bar charts comparing key ratios
- Ramo Overlap: Matrix showing which ramos each company competes in
- Growth Trajectories: Normalized growth curves (indexed to same starting point)
- Juicios Comparison: Compare litigation counts across selected companies

**Data Requirements:**
- Existing primas/siniestros/gastos data
- Juicios count per company

---

### 3. Financial Ratios ("Indicadores Financieros")

**Unit of Observation:** All market (with company-level drill-down)

**Description:** Focus on calculated ratios and financial health metrics across the industry.

**Key Ratios:**
- Siniestralidad: Siniestros / Primas Devengadas (loss ratio)
- Ratio de Gastos: Gastos / Primas Devengadas (expense ratio)
- Combined Ratio: Siniestralidad + Ratio de Gastos
- Retention Ratio: Primas Retenidas / Primas Emitidas (if data available)

**Visualizations:**
- Gauge charts for key ratios with green/yellow/red zones
- Scatter plot: Siniestralidad vs Growth (identify efficient growers)
- Distribution histogram: How many companies in each ratio band
- Ranking tables sorted by each ratio

**Data Requirements:**
- Existing primas/siniestros/gastos data

---

### 4. Trends & Time Series ("Evolución Temporal")

**Unit of Observation:** All market OR single company OR single ramo

**Description:** Historical analysis and trend detection over multiple periods.

**Key Sections:**
- Market Evolution: Total market primas over multiple years (line chart)
- Seasonality Analysis: Quarter-over-quarter patterns
- Growth Rates: YoY growth by ramo, by company
- Moving Averages: Smoothed trends to filter noise
- Comparative Lines: Overlay multiple years or entities

**Filters:**
- Compare multiple years simultaneously
- Select specific ramos to track
- Choose single company or market aggregate
- Toggle between nominal and real values (if inflation data available)

**Data Requirements:**
- Existing historical data across multiple periods

---

### 5. Litigation Analysis ("Análisis de Juicios")

**Unit of Observation:** All market (company-level breakdown)

**Description:** Analysis of litigation (juicios) patterns across the industry.

**Key Sections:**
- Juicios Ranking: Companies with most juicios (absolute count)
- Juicios Relative: Juicios per million pesos of primas (normalized)
- Trend Over Time: Are juicios increasing market-wide?
- Company Comparison: Bar chart of juicios by company
- Juicios vs Siniestros: Relationship between claims and litigation
- Risk Classification: Group companies by litigation intensity

**Note:** Currently juicios data is at company level only (not by ramo).

**Data Requirements:**
- Juicios count per company (available)
- Primas/siniestros for normalization

---

### 6. Investment Portfolio ("Inversiones y Activos")

**Unit of Observation:** Single company OR all market aggregate

**Description:** Analysis of insurer investment portfolios and asset composition.

**Key Sections:**
- Asset Allocation Pie: Bonds, equities, real estate, cash, etc.
- Portfolio Comparison: How different insurers allocate assets
- Investment vs Liabilities: Coverage ratios
- Market Average: Industry-wide asset allocation
- Risk Profile Classification: Conservative vs aggressive portfolios
- Company vs Market: Selected company's allocation vs industry average

**Data Requirements:**
- Inversiones data
- Composicion del activo data

---

### 7. Market Structure ("Estructura del Mercado")

**Unit of Observation:** All market (by ramo optional)

**Description:** Industry concentration and competitive dynamics.

**Key Sections:**
- Concentration Indices: HHI (Herfindahl-Hirschman Index) by ramo
- Market Share Distribution: Top 5, 10, 20 concentration
- Lorenz Curve: Visual representation of market concentration
- Segment Analysis: Large vs medium vs small insurers
- Ramo Competitiveness: Number of active players per ramo
- Entry/Exit Tracking: Companies that started/stopped issuing (if historical data allows)

**Data Requirements:**
- Existing primas data by company and ramo

---

### 8. Ramo Deep-Dive ("Análisis por Ramo")

**Unit of Observation:** Single ramo (all companies within it)

**Description:** Detailed analysis of one insurance branch.

**Key Sections:**
- Ramo KPIs: Total primas, siniestros, growth for selected ramo
- Subramo Breakdown: Detailed split within the ramo
- Leading Players: Rankings within this specific ramo
- Siniestralidad Trend: Historical loss ratio for this ramo
- Concentration: How concentrated is this ramo?
- Profitability Map: Bubble chart (size=primas, color=siniestralidad) by company

**Data Requirements:**
- Existing primas/siniestros data with ramo/subramo detail

---

### 9. Risk Dashboard ("Tablero de Riesgos")

**Unit of Observation:** All market (flagging individual companies)

**Description:** Identify companies or segments with elevated risk indicators.

**Key Sections:**
- Watch List: Companies with deteriorating ratios
- Risk Heatmap: Matrix of companies x risk factors, color-coded
- Trend Alerts: Companies where siniestralidad increased significantly YoY
- Litigation Exposure: Companies with high juicios counts
- Concentration Risk: Companies too dependent on single ramo
- Size vs Health Scatter: Identify large problematic players

**Data Requirements:**
- All existing data combined
- Juicios count per company

---

### 10. Executive Summary ("Resumen Ejecutivo")

**Unit of Observation:** All market (snapshot)

**Description:** One-page overview for leadership/board presentations.

**Key Sections:**
- Market Pulse: 3-4 key headline numbers with trend arrows
- Top Performers: Best companies by key metrics
- Concerns: Flagged issues or negative trends
- Market Growth: Single line chart showing overall trajectory
- Quick Comparisons: Selected benchmarks
- Period Highlights: Notable changes vs previous period

**Data Requirements:**
- All existing data

---

## Summary Table

| # | Dashboard | Unit of Observation | Complexity |
|---|-----------|---------------------|------------|
| 1 | Company Deep-Dive | Single company | Medium |
| 2 | Peer Comparison | 2-5 companies | Medium |
| 3 | Financial Ratios | All market | Medium |
| 4 | Trends & Time Series | Market / Company / Ramo | Medium |
| 5 | Litigation Analysis | All market (company breakdown) | Low-Medium |
| 6 | Investment Portfolio | Single company / All market | Medium |
| 7 | Market Structure | All market | Low-Medium |
| 8 | Ramo Deep-Dive | Single ramo | Medium |
| 9 | Risk Dashboard | All market | High |
| 10 | Executive Summary | All market | Low |

---

## Recommended Implementation Priority

Based on value, data availability, and complexity:

| Priority | Dashboard | Reason |
|----------|-----------|--------|
| 1 | Financial Ratios | Core analysis, uses existing data, high value |
| 2 | Company Deep-Dive | Natural extension, popular use case |
| 3 | Trends & Time Series | Leverages historical data already available |
| 4 | Litigation Analysis | Uses juicios data (company level), unique insight |
| 5 | Peer Comparison | High user value, builds on Company Deep-Dive |
| 6 | Investment Portfolio | Uses inversiones/activos data |
| 7 | Market Structure | Interesting for regulators/analysts |
| 8 | Ramo Deep-Dive | Useful for specialists |
| 9 | Executive Summary | Quick wins for presentations |
| 10 | Risk Dashboard | Most complex, needs all other data integrated |

---

## Data Notes

### Currently Available (company level):
- Primas emitidas / devengadas
- Siniestros devengados
- Gastos devengados
- Juicios count (company level only, not by ramo)
- Inversiones
- Composicion del activo

### Future Data Enhancements:
- Juicios by ramo (would enable ramo-level litigation analysis)
- Mediaciones, other claim types
- Geographic breakdown
- Client concentration data

---

## Next Steps

1. Choose 1-2 priority dashboards to implement next
2. Define specific API endpoints needed
3. Design mockups/wireframes
4. Implement incrementally

