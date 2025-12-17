# Company Profile - Detailed Design

## Data Available

### From subramos_historico (per company, per ramo, per period):

**Accumulated columns** (year-to-date):
- primas_emitidas, primas_devengadas, primas_cedidas
- siniestros_devengados, siniestros_pagados
- gastos_devengados + breakdown (sueldos, comisiones, honorarios, impuestos, publicidad, otros)

**Current columns** (3-month quarter only):
- Same metrics with `_current` suffix
- Dividing by 3 = monthly average

---

## 1. Resume Card (Header) - IMPLEMENTED

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Calendar] Septiembre 2025 [Acumulado]              [Trophy] #14 de 190    │
│                                                      en produccion          │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Icon] COMPANY NAME                                                         │
│        [Tipo Badge]  Cod: XXXX                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Primas      │  Ramos  │  Siniestralidad  │  Ratio Gastos  │  Resultado    │
│  $XXX M      │   XX    │     XX.X%        │    XX.X%       │   $XXX M      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ TOP 5 RAMOS:                                                                │
│ ● Automotores (45%)  ● Vida (25%)  ● Incendio (15%)  ● RC (10%)  ● Otros   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Context Bar**: Dark gradient bar at top with period and ranking
- **Period**: Formatted as "Septiembre 2025" with "Acumulado" badge
- **Ranking**: Trophy icon with position "#14 de 190 en produccion"
- **Ratio Gastos**: gastos_devengados / primas_devengadas * 100
- **Top 5 Ramos**: Show as inline badges/chips with % of primas

---

## 2. Resumen Tab - Key Results + Ratios - IMPLEMENTED

**Purpose**: Quick health snapshot with key results and YoY variations

### Section A: Resultados del Ejercicio (from otros_conceptos_historico)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESULTADOS DEL EJERCICIO                                                    │
│ Valores acumulados con variacion interanual                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Primas      │  │ Resultado   │  │ Resultado   │  │ Resultado   │        │
│  │ Emitidas    │  │ Tecnico     │  │ Financiero  │  │ Final       │        │
│  │   $XXX M    │  │   $XXX M    │  │   $XXX M    │  │   $XXX M    │        │
│  │  ↑ +12.5%   │  │  ↑ +8.3%    │  │  ↓ -5.2%    │  │  ↑ +15.1%   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources**:
- Primas Emitidas: from subramos_historico
- Resultado Tecnico: from otros_conceptos_historico
- Resultado Financiero: from otros_conceptos_historico
- Resultado Final: calculated (tecnico + financiero)

**YoY Calculation**:
- Compares same quarter previous year (e.g., 202503 vs 202403)
- Shows "N/A" if: zero division, no previous data, or variation > ±1000%
- Green arrow up for positive, red arrow down for negative

### Section B: Key Ratios

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RATIOS CLAVE (periodo actual)                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │Siniestralidad│  │Ratio Gastos│  │Combined Ratio│                        │
│  │   [GAUGE]   │  │   [GAUGE]   │  │   [GAUGE]    │                        │
│  │   65.5%     │  │   28.3%     │  │   93.8%      │                        │
│  │  ● Bueno    │  │  ● Normal   │  │  ● Bueno     │                        │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
│                                                                             │
│  Interpretacion:                                                            │
│  - Combined < 100% = rentable                                              │
│  - Combined > 100% = perdida tecnica                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Gauges/Indicators**:
- Siniestralidad: Green < 65%, Yellow 65-80%, Red > 80%
- Gastos: Green < 25%, Yellow 25-35%, Red > 35%
- Combined: Green < 95%, Yellow 95-105%, Red > 105%

### Section C: Portfolio Snapshot (Top 5 Ramos)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ COMPOSICION DEL PORTFOLIO (Top 5 Ramos)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Horizontal Bar Chart]                                                     │
│                                                                             │
│  Automotores    ████████████████████████████████  45.2%  │  $XXX M         │
│  Vida           ████████████████                  25.1%  │  $XXX M         │
│  Incendio       █████████                         15.3%  │  $XXX M         │
│  RC             ████                               8.2%  │  $XXX M         │
│  Otros          ███                                6.2%  │  $XXX M         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Operaciones Tab - Trends & Breakdown

**Purpose**: Deep dive into production, claims, and expenses over time

### Section A: Trend Selector

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FILTROS:  [Ultimos 8 trimestres ▼]  [Todos los Ramos ▼]  [Ver: Acumulado ▼]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section B: Production Trend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ EVOLUCION DE PRIMAS                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Line Chart: Primas Emitidas over time]                                   │
│                                                                             │
│     ^                                                                       │
│  $M │        ___________                                                   │
│     │    ___/           \___                                               │
│     │___/                   \___                                           │
│     └────────────────────────────►                                         │
│       Q1   Q2   Q3   Q4   Q1   Q2   Q3   Q4                               │
│       2023                2024                                             │
│                                                                             │
│  Crecimiento YoY: +12.5%                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section C: Siniestralidad Trend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ EVOLUCION DE SINIESTRALIDAD                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Line Chart: Siniestralidad % over time]                                  │
│                                                                             │
│     ^                                                                       │
│   % │  -------- 80% threshold                                              │
│     │        ___                                                           │
│     │    ___/   \___                                                       │
│     │___/           \___                                                   │
│     └────────────────────────►                                             │
│                                                                             │
│  Siniestralidad promedio: 68.2%                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section D: Breakdown by Ramo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SINIESTRALIDAD POR RAMO (periodo actual)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Ramo           │ Primas     │ Siniestros │ Siniestralidad │ Status       │
│  ───────────────┼────────────┼────────────┼────────────────┼──────────    │
│  Automotores    │  $XXX M    │   $XXX M   │     72.3%      │  ● Warning   │
│  Vida           │  $XXX M    │   $XXX M   │     45.2%      │  ● Good      │
│  Incendio       │  $XXX M    │   $XXX M   │     25.1%      │  ● Good      │
│  RC             │  $XXX M    │   $XXX M   │     95.3%      │  ● Critical  │
│  ...            │            │            │                │              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section E: Expense Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ESTRUCTURA DE GASTOS                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Donut Chart: Gastos Breakdown]                                           │
│                                                                             │
│       Comisiones  35%                                                       │
│       Sueldos     25%                                                       │
│       Impuestos   18%                                                       │
│       Honorarios   8%                                                       │
│       Publicidad   4%                                                       │
│       Otros       10%                                                       │
│                                                                             │
│  Total Gastos: $XXX M  |  Ratio: XX.X%                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Inversiones Tab - Asset Composition

**Data Source**: otros_conceptos_historico

### Section A: Patrimonio Evolution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PATRIMONIO NETO                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Large Number]  $XXX.XXX M                                                │
│  [Trend Arrow]   +5.2% vs periodo anterior                                 │
│                                                                             │
│  [Line Chart: Patrimonio over time]                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section B: Asset Composition

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ COMPOSICION DEL ACTIVO                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Donut Chart]              [Table]                                         │
│                             Titulos Publicos    $XXX M   35%               │
│      ████                   Fondos Comunes      $XXX M   28%               │
│    ██    ██                 Inmuebles           $XXX M   15%               │
│   ██      ██                Plazos Fijos        $XXX M   12%               │
│    ██    ██                 Disponibilidades    $XXX M    8%               │
│      ████                   Otros               $XXX M    2%               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section C: Coverage Ratio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ COBERTURA DE DEUDAS                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Inversiones / Deudas con Asegurados = XXX%                                │
│                                                                             │
│  [Progress Bar]  ██████████████░░░░░░  145%                                │
│                                                                             │
│  Interpretacion: > 100% significa que las inversiones                      │
│  cubren las obligaciones con asegurados                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Comparacion Tab - Market Position

### Section A: Market Position

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ POSICION EN EL MERCADO                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Ranking General: #XX de XXX companias                                     │
│  Ranking en [Tipo]: #XX de XX companias                                    │
│                                                                             │
│  Market Share: X.X%                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section B: Peer Comparison Radar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ COMPARACION CON PEERS (mismo tipo: Generales)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Radar Chart]                                                              │
│                                                                             │
│           Size                                                              │
│            /\                                                              │
│           /  \                                                             │
│    Growth/    \Efficiency                                                  │
│          \    /                                                            │
│           \  /                                                             │
│   Solvency \/  Profitability                                               │
│                                                                             │
│  ── Company    -- Market Avg    ·· Top Performer                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Section C: Peer Table

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RANKING DE PEERS                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  # │ Compania        │ Primas    │ Share │ Siniestralidad │ Growth        │
│ ───┼─────────────────┼───────────┼───────┼────────────────┼──────────     │
│  1 │ ALLIANZ    ★    │ $XXX M    │ 8.5%  │     65.2%      │  +12.5%       │
│  2 │ ZURICH          │ $XXX M    │ 7.2%  │     68.1%      │   +8.3%       │
│  3 │ MAPFRE          │ $XXX M    │ 5.8%  │     72.3%      │   +5.1%       │
│ ...│ ...             │           │       │                │               │
│                                                                             │
│  ★ = Selected company                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Resume Card + Resumen Tab (Simple) - COMPLETED
1. ✅ Add gastos % to header card
2. ✅ Add top 5 ramos to header card
3. ✅ Resultados del Ejercicio with YoY (replaced monthly averages)
4. ✅ Key ratios with simple color indicators
5. ✅ Portfolio bar chart
6. ✅ Context bar with period and ranking

### Phase 2: Operations Tab
1. Backend: Add endpoint for historical data by company
2. Line charts for primas and siniestralidad
3. Table with breakdown by ramo
4. Expense donut chart

### Phase 3: Inversiones Tab
1. Backend: Load otros_conceptos data
2. Asset composition donut
3. Patrimonio trend

### Phase 4: Comparacion Tab
1. Backend: Peer comparison endpoint
2. Radar chart
3. Peer ranking table

---

## API Endpoints Needed

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `GET /api/data/companies/:codCia` | Company profile with results, ranking, YoY | ✅ DONE |
| `GET /api/company/:codCia/portfolio` | Ramo breakdown | Included in profile |
| `GET /api/company/:codCia/history` | Historical KPIs | PENDING |
| `GET /api/company/:codCia/expenses` | Expense breakdown | PENDING |
| `GET /api/company/:codCia/investments` | From otros_conceptos | PENDING |
| `GET /api/company/:codCia/peers` | Peer comparison | PENDING |

