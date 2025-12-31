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
│ RATIOS CLAVE (periodo acumulado)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │Ratio Combinado│ │Siniestralidad│ │Ratio Gastos│                         │
│  │   93.8%     │  │   65.5%     │  │   28.3%     │                         │
│  │  ● Bueno    │  │  ● Bueno    │  │  ● Normal   │                         │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤                         │
│  │ Mercado     │  │ Mercado     │  │ Mercado     │                         │
│  │ Generales   │  │ Generales   │  │ Generales   │                         │
│  │   98.5%     │  │   70.2%     │  │   28.3%     │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
│                                                                             │
│  Interpretacion:                                                            │
│  - Combined < 100% = rentable                                              │
│  - Combined > 100% = perdida tecnica                                       │
│  - "Mercado" = promedio de companias del mismo tipo (Generales, ART, etc.) │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Color Indicators**:
- Siniestralidad: Green < 65%, Yellow 65-80%, Red > 80%
- Gastos: Green < 25%, Yellow 25-35%, Red > 35%
- Combined: Green < 95%, Yellow 95-105%, Red > 105%

**Market Comparison**:
- Shows average ratio for companies in same tipo_cia group
- Helps contextualize company performance vs peers
- Calculated as mean of individual company ratios (not weighted)

### Section C: Portfolio Breakdown - Treemap Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ COMPOSICION DE CARTERA                                                      │
│ Tamano segun primas emitidas • Verde si RC ≤ 100% • Rojo si RC > 100%      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Treemap Visualization - All Ramos]                                        │
│                                                                             │
│  ┌──────────────────────┬────────┬──────────────┬────────┐                 │
│  │                      │ Robo y │              │Automot.│                 │
│  │  Combinado Familiar  │Riesgos │Otros Riesgos │ 133.3% │                 │
│  │      87.5%           │ 99.7%  │   81.8%      │ (RED)  │                 │
│  │      (GREEN)         │(GREEN) │   (GREEN)    ├────────┤                 │
│  │                      ├────────┼──────────────┤ Salud  │                 │
│  │                      │Caucion │  Accidentes  │ 369.8% │                 │
│  ├──────────────────────┤ 56.2%  │  Personales  │ (RED)  │                 │
│  │                      │(GREEN) │   64.7%      ├────────┤                 │
│  │       Vida           │        │   (GREEN)    │        │                 │
│  │      80.5%           ├────────┴──────────────┤Riesgos │                 │
│  │     (GREEN)          │      Sepelio          │Agropec.│                 │
│  │                      │      83.3%            │ 542.5% │                 │
│  │                      │     (GREEN)           │ (RED)  │                 │
│  └──────────────────────┴───────────────────────┴────────┘                 │
│                                                                             │
│  Hover para detalles: Primas, % Cartera, Ratio Combinado                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- **Box Size**: Proportional to primas_emitidas (minimum 5% of max for visibility)
- **Box Color**:
  - Deep forest green (#065f46) if combined ratio ≤ 100%
  - Deep crimson red (#991b1b) if combined ratio > 100%
- **Text Display**:
  - Ramo name (top line) with intelligent word wrapping
  - Combined ratio percentage (bottom line, larger font)
  - Warm off-white text (#fffbeb) with drop shadows for readability
  - Dynamic font sizing: 10-18px for names, 14-24px for ratios (scales with box size)
- **Text Wrapping**:
  - Automatically wraps long names like "Riesgos Agropecuarios" across multiple lines
  - Splits at word boundaries for clean display
  - Uses 85% of box width to maintain margins
  - Line height: 1.2× font size for optimal readability
- **Interactive Tooltip**:
  - Primas emitidas (currency formatted)
  - % de Cartera
  - Ratio Combinado
  - Color-coded border matching box performance (green/red)
  - Dark background with backdrop blur for clarity
- **Visibility Filter**: Only shows labels on boxes > 30px width/height
- **All Ramos Included**: Shows complete portfolio composition, not just top 5

---

## 3. Operaciones Tab - IMPLEMENTED

**Purpose**: Deep dive into ratios, production, claims, and technical result over time

### Section A: Ramo Selector

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Ramo: [Todos los Ramos ▼]                    Mostrando datos de: [Ramo]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features**:
- Dropdown with all company's ramos
- "Todos los Ramos" for aggregate view
- All charts filter by selected ramo
- Market line also filters by ramo

### Section B: Evolucion de Ratios (Datos de Balance)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ EVOLUCION DE RATIOS (Datos de Balance)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Multi-line Chart - Nivo ResponsiveLine]                                  │
│                                                                             │
│     ^                                                                       │
│  %  │  -------- 100% Equilibrio (dashed)                                   │
│     │    ___  Ratio Combinado (red, thick)                                 │
│     │___/   \___  Mercado (gray)                                           │
│     │    Siniestralidad (light blue, thin)                                 │
│     │    Gastos (amber, thin)                                              │
│     └────────────────────────────►                                         │
│                                                                             │
│  Legend: ● Ratio Combinado ● Mercado ● Siniestralidad ● Gastos            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features**:
- Uses ACCUMULATED values for ratio calculation
- Custom line widths: RC=4, Market=2.5, Others=1.5
- 100% equilibrium reference line
- Slice tooltips showing all values at each point

### Section C: Primas y Siniestros (Datos trimestrales)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PRIMAS Y SINIESTROS (Datos trimestrales)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Area Chart - Recharts]                                                   │
│                                                                             │
│     ^    ████████  Primas (blue gradient)                                  │
│  $M │   ████████████                                                       │
│     │  ████████████████                                                    │
│     │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Siniestros (red gradient)                         │
│     └────────────────────────────►                                         │
│       Q1'23  Q2'23  Q3'23  Q4'23  Q1'24  Q2'24                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features**:
- Uses _CURRENT values (3-month quarterly data)
- primasDevengadasCurrent and siniestrosDevengadosCurrent
- Gradient fills for visual appeal

### Section D: Resultado Tecnico (Datos trimestrales)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESULTADO TECNICO (Datos trimestrales)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Bar Chart - Recharts]                                                    │
│                                                                             │
│     ^                                                                       │
│  $M │   ██     ██ ██                                                       │
│     │   ██  ██ ██ ██                                                       │
│  0  │───██──██─██─██───────────────────                                    │
│     │      ██                                                               │
│     │      ██  (red = negative)                                            │
│     └────────────────────────────►                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features**:
- Uses _CURRENT values (3-month quarterly data)
- resultadoTecnicoCurrent = primas - siniestros - gastos (calculated)
- Green bars for positive, red for negative
- Zero reference line

### Section E: Puente de Resultado Tecnico (Rolling 12 meses)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▼ PUENTE DE RESULTADO TECNICO (Rolling 12 meses)  R12 Sep'23 → R12 Sep'24 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Waterfall Chart - Recharts]                                              │
│                                                                             │
│     ^                                                                       │
│  $M │                          ██                                          │
│     │  ██          ██          ██                                          │
│     │  ██    ██    ██    ██    ██                                          │
│     │  ██    ██    ██    ██    ██                                          │
│     └──────────────────────────────►                                       │
│       Resultado  Δ Primas  Δ Siniestros  Δ Gastos  Resultado              │
│        R12 Ant.   (+/-)      (inverted)   (inverted)  R12 Act.            │
│                                                                             │
│  Legend: ■ Resultado R12  ■ Impacto positivo  ■ Impacto negativo          │
│                                                                             │
│  ℹ Este grafico muestra por que cambio el resultado tecnico entre dos     │
│    periodos rolling 12 meses. Las barras intermedias representan el       │
│    impacto de cada componente.                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features**:
- Collapsible (starts collapsed)
- Requires minimum 8 quarters of data
- Compares two rolling 12-month windows:
  - Current R12: Sum of last 4 quarters (_current values)
  - Previous R12: Sum of 4 quarters before that
- 5 bars: Initial R12 → Δ Primas → Δ Siniestros → Δ Gastos → Final R12
- Sign convention:
  - Primas: positive impact if increased
  - Siniestros/Gastos: inverted (×-1) - increase is bad
- Validation: Initial + impacts must equal Final

### Section F: Alertas Operacionales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ALERTAS OPERACIONALES                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔴 Ratio Combinado > 100% Sostenido                                       │
│     El ratio combinado ha superado el 100% durante 5 periodos consecutivos.│
│                                                                             │
│  🟡 Deterioro Interanual Significativo                                     │
│     El ratio combinado aumento 15.3 puntos porcentuales vs. año anterior.  │
│                                                                             │
│  🔵 Ratio Combinado Saludable                                              │
│     El ratio combinado actual es 85.2%, indicando margen tecnico positivo. │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Alert Types**:
- `ratio_above_100`: Critical if RC > 100% for 3+ consecutive periods
- `yoy_deterioration`: Warning if RC increased > 10 points YoY
- `growth_imbalance`: Warning if siniestros grow 15%+ faster than primas
- `healthy_ratio`: Info if RC < 95% and no other alerts

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
5. ✅ Key ratios reordered (Ratio Combinado first, then Siniestralidad, then Gastos %)
6. ✅ Market average comparison for ratios (same tipo_cia group)
7. ✅ Portfolio treemap visualization (replaced bar chart)
   - Shows ALL ramos with full metrics
   - Box size based on primas_emitidas
   - Color coded by combined ratio performance (green/red)
   - Intelligent text wrapping for long ramo names
   - Dynamic font sizing based on box size
   - Simplified interactive tooltip
8. ✅ Context bar with period and ranking
9. ✅ Negative value handling in ratio calculations

### Phase 2: Operations Tab - COMPLETED
1. ✅ Backend: GET /api/data/companies/{cod_cia}/operations endpoint
2. ✅ Evolucion de Ratios - Nivo line chart (accumulated values, market comparison)
3. ✅ Primas y Siniestros - Recharts area chart (quarterly _current values)
4. ✅ Resultado Tecnico - Recharts bar chart (quarterly _current values)
5. ✅ Puente Rolling 12 - Waterfall chart (YoY comparison of rolling 12 months)
6. ✅ Alertas Operacionales - Calculated from data patterns
7. ✅ Ramo selector with full filtering (including market line)
8. ✅ Chart subtitles clarifying data type (Datos de Balance vs Datos trimestrales)

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
| `GET /api/data/companies/:codCia/operations` | Time series for Operations tab | ✅ DONE |
| `GET /api/company/:codCia/expenses` | Expense breakdown | PENDING |
| `GET /api/company/:codCia/investments` | From otros_conceptos | PENDING |
| `GET /api/company/:codCia/peers` | Peer comparison | PENDING |

