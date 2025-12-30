# Company Deep-Dive Dashboard - Architecture Plan

## Overview

This document outlines the architecture for adding a Company Deep-Dive dashboard to the Argentine Insurance Market visualization project.

---

## 1. Navigation Architecture

### Global Sidebar Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (collapsible)          │  MAIN CONTENT AREA             │
│                                │                                 │
│ ┌────────────────────────────┐ │                                 │
│ │ 🏠 Mercado                 │ │  (Current dashboard or          │
│ │   └─ Visión General        │ │   selected page)                │
│ │                            │ │                                 │
│ │ 🏢 Compañías               │ │                                 │
│ │   └─ Perfil de Compañía    │ │                                 │
│ │                            │ │                                 │
│ │ ⚖️ Comparaciones           │ │                                 │
│ │   └─ Comparar Compañías    │ │                                 │
│ └────────────────────────────┘ │                                 │
│                                │                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Market Overview | Current dashboard (existing) |
| `/mercado` | Market Overview | Alias for home |
| `/compania` | Company Selection | Company picker page |
| `/compania/:codCia` | Company Deep-Dive | Single company analysis |
| `/comparar` | Comparison | Multi-company comparison |

### Navigation Flow

```
User enters app
    │
    ▼
┌─────────────────┐
│ Market Overview │  ← Default landing page
│ (Visión General)│
└────────┬────────┘
         │
         │ Click sidebar "Compañías"
         ▼
┌─────────────────┐
│ Company Select  │  ← Search/select company
│ (Selector)      │
└────────┬────────┘
         │
         │ Select company
         ▼
┌─────────────────┐
│ Company Profile │  ← Deep-dive tabs
│ (Perfil)        │
└─────────────────┘
```

---

## 2. Company Deep-Dive Page Structure

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ [Company Name]  [Company Type Badge]  [Period Selector]         │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│ TAB BAR (4 tabs - simplified)                                   │
│ ┌──────────┬─────────────┬─────────────┬─────────────┐          │
│ │ Resumen  │ Operaciones │ Inversiones │ Comparación │          │
│ └──────────┴─────────────┴─────────────┴─────────────┘          │
│                                                                 │
│ TAB CONTENT                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │  (Content varies by selected tab)                           │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Tab Structure (4 Tabs)

---

#### Tab 1: Resumen (Overview)
**Purpose:** Executive summary - quick health check of the company

**Content:**

**Section A: KPI Cards Row** (6 cards)
- Primas Emitidas (with trend arrow vs previous period)
- Primas Devengadas
- Siniestros Devengados
- Gastos Devengados
- Resultado Técnico
- Patrimonio Neto

**Section B: Key Ratios Cards** (3-4 cards)
- Siniestralidad (Siniestros / Primas Devengadas)
- Ratio de Gastos (Gastos / Primas Devengadas)
- Combined Ratio (Siniestralidad + Gastos)
- Cobertura (Inversiones / Deudas con Asegurados)

**Section C: Mini Charts Row** (sparklines)
- Primas trend (last 8 quarters)
- Siniestralidad trend (last 8 quarters)
- Market share evolution

**Section D: Portfolio Snapshot**
- Donut: Distribution by Ramo (current period)
- Top 3 Ramos with % share

---

#### Tab 2: Operaciones (Operations - Production + Claims + Expenses)
**Purpose:** Full technical cycle analysis - the core insurance business

**Content:**

**Section A: Producción (Production)**
- Line chart: Primas Emitidas & Devengadas over last 8-12 quarters
- YoY growth indicators
- Primas Cedidas trend (reinsurance ceded)

**Section B: Composición por Ramo (Portfolio)**
- Stacked bar chart: Primas by Ramo over time (portfolio evolution)
- Treemap or table: Current period Ramo → Subramo breakdown
- Click on Ramo to see Subramo detail

**Section C: Siniestralidad (Claims Performance)**
- Line chart: Siniestralidad ratio over time
- Comparison: Siniestros Devengados vs Siniestros Pagados
- Benchmark line showing market average (optional)

**Section D: Estructura de Gastos (Expense Structure)**
- Donut chart: Gastos breakdown (Sueldos, Comisiones, Honorarios, Impuestos, Publicidad, Otros)
- Stacked area or bar: Expense evolution over time
- Ratio de Gastos trend line

**Section E: Resultado Técnico (Combined Analysis)**
- Stacked bar: Siniestralidad + Gastos Ratio by period
- Goal line at 100% (breakeven)
- Resultado Técnico trend (profit/loss from insurance operations)

---

#### Tab 3: Inversiones y Balance (Investments & Balance)
**Purpose:** Financial health and asset composition

**Data Source:** otros_conceptos_historico

**Content:**

**Section A: Patrimonio Neto**
- Large KPI card with trend
- Line chart: Evolution over time

**Section B: Composición del Activo (Asset Composition)**
- Donut chart: Investment breakdown
  - Títulos Públicos
  - Fondos Comunes
  - Acciones
  - Plazos Fijos
  - Inmuebles
  - Disponibilidades
  - Otros

**Section C: Evolución de Activos (Asset Evolution)**
- Stacked area chart: Asset composition over time
- Shows if portfolio is becoming more/less conservative

**Section D: Resultados Financieros**
- Bar chart comparing per quarter:
  - Resultado Técnico
  - Resultado Financiero
  - Resultado Operaciones
- Shows contribution of each to overall result

**Section E: Cobertura de Deudas**
- Ratio: Inversiones / Deudas con Asegurados
- Trend over time
- Health indicator (good/warning/critical)

---

#### Tab 4: Comparación (Comparison with Market)
**Purpose:** Benchmark company against peers in same segment

**Content:**

**Section A: Peer Group Filter**
- Auto-filtered by `tipo_cia` (Generales, Vida, ART, etc.)
- Option to manually select/deselect specific competitors

**Section B: Market Position**
- Ranking card: Position in market (by primas)
- Market share % with trend

**Section C: Radar Chart**
- Multi-axis comparison (5-6 dimensions):
  - Size (Primas)
  - Growth (YoY %)
  - Profitability (Resultado Técnico / Primas)
  - Efficiency (Ratio de Gastos)
  - Claims Performance (Siniestralidad)
  - Solvency (Patrimonio / Primas)
- Lines: Company vs Market Average vs Top Performer

**Section D: Comparative Bars**
- Horizontal bar charts showing:
  - Company metric vs Market average
  - For: Siniestralidad, Gastos Ratio, Combined, Growth

**Section E: Peer Table**
- Sortable table of all companies in same tipo_cia
- Columns: Company, Primas, Market Share, Siniestralidad, Growth
- Highlight current company row
- Sortable by any column

---

## 3. Company Selection Page

Before entering Company Deep-Dive, users need to select a company.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Seleccionar Compañía                                    │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search: [                                              ] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│ │ Filter:      │  │ Tipo:        │  │ Sort by:     │           │
│ │ [All Ramos ▼]│  │ [Generales ▼]│  │ [Primas    ▼]│           │
│ └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                 │
│ COMPANY CARDS GRID                                              │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│ │ ALLIANZ        │ │ ZURICH         │ │ MAPFRE         │       │
│ │ Generales      │ │ Generales      │ │ Generales      │       │
│ │ $XXX.XXX M     │ │ $XXX.XXX M     │ │ $XXX.XXX M     │       │
│ │ [Ver Perfil →]│ │ [Ver Perfil →]│ │ [Ver Perfil →]│       │
│ └────────────────┘ └────────────────┘ └────────────────┘       │
│                                                                 │
│ Pagination or infinite scroll                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Requirements

### New API Endpoints Needed

#### Company List & Selection

| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/companies` | List all companies with basic info | `[{cod_cia, nombre_corto, tipo_cia, total_primas}]` |
| `GET /api/company/:codCia/profile` | Company basic info | `{cod_cia, nombre_corto, tipo_cia, ramos_count}` |

#### Company KPIs & Ratios

| Endpoint | Description |
|----------|-------------|
| `GET /api/company/:codCia/kpis` | Company KPIs for period |
| `GET /api/company/:codCia/kpis/history` | KPIs over multiple periods |
| `GET /api/company/:codCia/ratios` | Calculated ratios (siniestralidad, gastos, combined) |
| `GET /api/company/:codCia/ratios/history` | Ratios over time |

#### Company Portfolio (Operaciones Tab)

| Endpoint | Description |
|----------|-------------|
| `GET /api/company/:codCia/portfolio` | Ramo distribution current period |
| `GET /api/company/:codCia/portfolio/history` | Portfolio evolution over time |
| `GET /api/company/:codCia/portfolio/ramo/:ramo` | Subramo detail for specific ramo |
| `GET /api/company/:codCia/expenses` | Expense breakdown (gastos detail) |
| `GET /api/company/:codCia/expenses/history` | Expense evolution |

#### Company Investments (Inversiones Tab)

| Endpoint | Description |
|----------|-------------|
| `GET /api/company/:codCia/investments` | Investment composition (from otros_conceptos) |
| `GET /api/company/:codCia/investments/history` | Investment evolution |
| `GET /api/company/:codCia/balance` | Balance sheet items (patrimonio, deudas) |
| `GET /api/company/:codCia/results` | Financial results (tecnico, financiero, operaciones) |

#### Comparison Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/comparison/peers/:codCia` | Peer companies (same tipo_cia) with metrics |
| `GET /api/comparison/ranking` | All companies ranked by selected metric |
| `GET /api/comparison/benchmarks/:tipoCia` | Market averages for company type |

---

## 5. Frontend Components Needed

### New Components Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              # NEW: Collapsible sidebar navigation
│   │   └── MainLayout.tsx           # NEW: Layout wrapper with sidebar
│   │
│   ├── company/
│   │   ├── CompanyHeader.tsx        # NEW: Company name, type, period selector
│   │   ├── CompanyTabs.tsx          # NEW: Tab navigation (4 tabs)
│   │   ├── CompanySelector.tsx      # NEW: Search/filter company list
│   │   ├── CompanyCard.tsx          # NEW: Company card for selection grid
│   │   │
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx      # NEW: Resumen tab content
│   │   │   ├── OperationsTab.tsx    # NEW: Operaciones tab (production+claims+expenses)
│   │   │   ├── InvestmentsTab.tsx   # NEW: Inversiones y Balance tab
│   │   │   └── ComparisonTab.tsx    # NEW: Comparación tab
│   │   │
│   │   └── widgets/
│   │       ├── RatioCard.tsx        # NEW: Ratio display with indicator
│   │       ├── TrendSparkline.tsx   # NEW: Mini trend chart
│   │       ├── PortfolioTreemap.tsx # NEW: Ramo hierarchy visual
│   │       └── RadarComparison.tsx  # NEW: Multi-axis peer comparison
│   │
│   ├── charts/
│   │   ├── LineChart.tsx            # NEW: Time series chart
│   │   ├── StackedAreaChart.tsx     # NEW: Evolution chart
│   │   └── HorizontalBarChart.tsx   # NEW: Comparison bars
│   │
│   └── comparison/
│       ├── PeerSelector.tsx         # NEW: Multi-select peer companies
│       └── BenchmarkTable.tsx       # NEW: Sortable peer comparison table
│
├── pages/
│   ├── MarketOverview.tsx           # REFACTOR: Extract from App.tsx
│   ├── CompanySelect.tsx            # NEW: Company selection page
│   ├── CompanyProfile.tsx           # NEW: Company deep-dive page
│   └── Comparison.tsx               # NEW: Comparison page (future)
│
├── hooks/
│   ├── useCompanyProfile.ts         # NEW: Fetch company data
│   ├── useCompanyHistory.ts         # NEW: Fetch historical data
│   ├── useCompanyRatios.ts          # NEW: Fetch/calculate ratios
│   ├── useCompanyInvestments.ts     # NEW: Fetch otros_conceptos data
│   └── usePeerComparison.ts         # NEW: Fetch peer data
│
└── types/
    └── company.ts                   # NEW: Company-specific types
```

### Routing Setup

```tsx
// main.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <MainLayout>  {/* Contains Sidebar */}
    <Routes>
      <Route path="/" element={<MarketOverview />} />
      <Route path="/mercado" element={<MarketOverview />} />
      <Route path="/compania" element={<CompanySelect />} />
      <Route path="/compania/:codCia" element={<CompanyProfile />} />
      <Route path="/comparar" element={<Comparison />} />
    </Routes>
  </MainLayout>
</BrowserRouter>
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Routing + Sidebar) ✅ COMPLETED
- [x] Install react-router-dom
- [x] Create navigation structure
- [x] Refactor current App.tsx content into MarketOverview page
- [x] Basic route navigation working

### Phase 2: Company Selection Page ✅ COMPLETED
- [x] Create CompanySelect page
- [x] Add `GET /api/data/companies/list` endpoint
- [x] Company cards grid with search/filter
- [x] Filter by tipo_cia
- [x] Navigation to company profile

### Phase 3: Company Deep-Dive - Resumen Tab ✅ COMPLETED
- [x] Create CompanyProfile page with 4-tab structure
- [x] Add company-specific API endpoints (`GET /api/data/companies/{cod_cia}`)
- [x] Implement OverviewTab with KPIs and ratios
  - [x] Resultados del Ejercicio (Primas, Resultado Técnico, Financiero, Final)
  - [x] YoY variations with intelligent handling (filters out extremes)
  - [x] Ratios Clave (Ratio Combinado, Siniestralidad, Gastos %)
  - [x] Market average comparison (same tipo_cia group)
  - [x] Negative value handling in calculations
- [x] Portfolio visualization (treemap instead of donut)
  - [x] Shows ALL ramos with full metrics (not just top 5)
  - [x] Box size based on primas_emitidas
  - [x] Color coded by combined ratio (green ≤ 100%, red > 100%)
  - [x] Intelligent text wrapping for long ramo names
  - [x] Dynamic font sizing (10-18px names, 14-24px ratios)
  - [x] Simplified interactive tooltip

### Phase 4: Company Deep-Dive - Operaciones Tab
- [ ] Add historical endpoints (primas, portfolio, expenses)
- [ ] Implement LineChart component for trends
- [ ] Portfolio breakdown (treemap or stacked bar)
- [ ] Expense breakdown donut
- [ ] Siniestralidad and Combined ratio charts

### Phase 5: Company Deep-Dive - Inversiones Tab
- [ ] Add otros_conceptos endpoints
- [ ] Investment composition donut
- [ ] Asset evolution stacked area
- [ ] Patrimonio and results visualization
- [ ] Cobertura indicator

### Phase 6: Company Deep-Dive - Comparación Tab
- [ ] Peer filtering by tipo_cia
- [ ] Radar chart comparison
- [ ] Comparative horizontal bars
- [ ] Benchmark table

### Phase 7: Polish & Integration
- [ ] Click-through from Market Overview to Company (optional)
- [ ] Loading states and error handling
- [ ] Responsive design adjustments
- [ ] Performance optimization

---

## 7. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Number of tabs | 4 | Simplified: Resumen, Operaciones, Inversiones, Comparación |
| Routing library | react-router-dom v6 | Industry standard, TypeScript support |
| Sidebar position | Left side, collapsible | Common pattern, mobile-friendly |
| Tab implementation | URL-based | Deep-linking, browser back button works |
| Company ID | cod_cia | Unique identifier from data |
| Historical periods | Last 8 quarters | ~2 years context |
| Comparison group | tipo_cia | Natural peer grouping |

---

## 8. Data Mapping

### From subramos_historico (Production/Claims/Expenses)

| UI Element | Data Fields |
|------------|-------------|
| Primas KPIs | primas_emitidas, primas_devengadas, primas_cedidas |
| Siniestros KPIs | siniestros_devengados, siniestros_pagados |
| Gastos KPIs | gastos_devengados |
| Gastos Breakdown | gs_exp_sueldos, gs_prod_comisiones, gs_exp_honorarios, gs_exp_impuestos, gs_exp_publicidad, gs_exp_otros |
| Portfolio | Group by ramo_nombre_corto, subramo_nombre_corto |
| Ratios | Calculated: siniestros/primas, gastos/primas |

### From otros_conceptos_historico (Investments/Balance)

| UI Element | Data Fields |
|------------|-------------|
| Patrimonio | patrimonio_neto |
| Inversiones Total | inversiones |
| Investment Breakdown | titulos_publicos_local, titulos_publicos_ext, fondos_comunes_loc, fondos_comunes_ext, acciones_locales, acciones_exterior, plazo_fijo_local, plazo_fijo_ext, inmuebles_inversion, inmuebles_uso_propio, disponibilidades |
| Deudas | deudas_con_asegurados |
| Results | resultado_tecnico, resultado_financiero, resultado_operaciones |

---

## 9. Open Questions for Future

1. **Click-through from Market Overview**: Nice to have - click company bar → go to profile
2. **Favorites/Watchlist**: Save favorite companies for quick access
3. **Export functionality**: Export to Excel/PDF per tab
4. **Alerts/Thresholds**: Highlight when ratios exceed thresholds
5. **Full Comparison page**: Dedicated comparison beyond the tab

---

## Next Steps

1. ✅ Review and approve this plan
2. Start with Phase 1: Foundation (routing + sidebar)
3. Iterate through phases with feedback after each

