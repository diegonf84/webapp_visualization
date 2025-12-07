# Implementation Plan - Insurance Metrics Dashboard

## Project Overview
Web application for visualizing insurance metrics in Argentina, based on historical data from the Superintendencia de Seguros de la Nación.

**Current Status:** Phase 1 (Prototype) - COMPLETED
**Next Phase:** Web Application (framework TBD)

---

## Phase 1: Interactive Dashboard Prototype ✅ COMPLETED

### Project Structure
```
webapp_visualization/
├── app.py                      # Main application
├── config.py                   # Configuration (data paths, colors, settings)
├── requirements.txt            # Python dependencies
├── README.md                   # Usage documentation
├── src/
│   ├── data/
│   │   └── loader.py          # Data loading (parquet/csv with caching)
│   ├── logic/
│   │   ├── aggregations.py    # Core aggregation functions
│   │   └── rankings.py        # Top-N rankings
│   ├── components/
│   │   ├── filters.py         # Filter components and view mode toggle
│   │   ├── kpi_cards.py       # KPI card components
│   │   └── charts.py          # Chart configurations with dual palettes
│   └── layouts/
│       └── market_overview.py # Main dashboard layout
└── assets/
    └── styles.css             # Custom CSS styling
```

### Implemented Features

#### 1. Data Layer ✅
- **Flexible data loading**: Supports Parquet, CSV, and sample CSV files
- **In-memory caching**: Singleton DataLoader with force_reload option
- **Data preparation**: Automatic type conversion, year/quarter extraction
- **Dual metric columns**: Support for both accumulated and current period data

**Key Columns:**
- `periodo`: Period in YYYYQQ format
- `fiscal_quarter`: Q1-Q4 (fiscal year)
- `cod_cia` / `nombre_corto`: Company code/name
- `ramo_nombre_corto`: Branch (Automotores, Vida, etc.)
- `subramo_nombre_corto`: Sub-branch detail
- `primas_emitidas`: Issued premiums (accumulated)
- `primas_emitidas_current`: Issued premiums (current period)
- Similar pattern for `primas_devengadas`, `siniestros_devengados`, `gastos_devengados`

#### 2. Filters ✅
- **Year**: Single select from available years
- **Quarter**: Single select (Marzo/Q3, Junio/Q4, Septiembre/Q1, Diciembre/Q2)
- **Ramo**: Single select with clear option
- **Entidad**: Multi-select for company filtering

**Fiscal Calendar:**
- Q1 = July-September (ends in 03)
- Q2 = October-December (ends in 04)
- Q3 = January-March (ends in 01)
- Q4 = April-June (ends in 02)

#### 3. View Mode Toggle ✅
- **Acumulado**: Shows accumulated values from start of fiscal year
- **Corriente**: Shows only current period values
- Visual indicator badge showing active mode
- One-click switching between modes

#### 4. KPI Cards ✅
Displays totals based on filtered data:
- Total Primas Emitidas
- Total Primas Devengadas
- Total Siniestros Devengados
- Entities count

All KPIs update dynamically based on view mode (accumulated/current)

#### 5. Charts ✅

**Stacked Bar Chart - "Total del Mercado":**
- X-axis: Company names (top N)
- Y-axis: Primas emitidas (millions)
- Color: Ramo or Subramo (depending on filter)
- Dual color palettes:
  - Ramos: Blue-toned palette for broader categories
  - Subramos: High-contrast vibrant colors for fewer categories
- Automatic palette selection based on view

**Donut Chart - Distribution:**
- Values: Primas emitidas by ramo/subramo
- Percentages displayed
- Same dual palette system as bar chart

#### 6. Top-N Selector ✅
- Buttons: TOP 10, TOP 15, TOP 20, TOP 50
- Applied after filtering (not before)
- Default: TOP 15
- Active button shows filled style

#### 7. Business Logic ✅

**Aggregations:**
- Dynamic grouping by company, ramo, subramo
- Support for both accumulated and current data columns
- Automatic column renaming for consistent downstream usage

**Rankings:**
- Filter → Aggregate → Top-N (in correct order)
- Configurable N value

**Data Flow:**
```
User selects filters → Filter data → Aggregate (accumulated OR current) →
→ Apply Top-N → Generate charts
```

### Technical Implementation Details

**Stack:**
- Framework: Plotly Dash 2.x with Dash Bootstrap Components
- Data processing: Pandas + PyArrow
- Charts: Plotly Express + Graph Objects
- Styling: Bootstrap 5 + custom CSS

**Color Palettes:**
- Ramos: 10-color blue/purple/orange palette for broad categories
- Subramos: 10-color high-contrast palette (red, blue, green, orange, purple)

**Formatting:**
- Currency: `$ X.XXX M` (millions, Argentine format)
- Numbers: Periods as thousand separators
- Percentages: `XX.X%`

### Configuration
- Data source: Local files (parquet/csv) with fallback to sample files
- Debug mode: Configurable via environment variables
- Host/Port: Configurable (default: 0.0.0.0:8050)

---

## Phase 2: Web Application (Future Implementation)

### Architecture (Framework-Agnostic)

**Backend Requirements:**
- RESTful API serving aggregated data
- Endpoints for filters, KPIs, rankings, chart data
- Reuse existing Python logic for aggregations and calculations
- Support for both accumulated and current data modes

**Suggested Endpoints:**
```
GET /api/filters                # Available filter options
GET /api/kpis                   # KPI totals
GET /api/market/companies       # Top N companies data
GET /api/market/distribution    # Ramo/Subramo distribution
```

**Frontend Requirements:**
- Interactive filters with state management
- View mode toggle (accumulated/current)
- KPI cards display
- Interactive charts (bar + donut)
- Top-N selector
- Responsive design

**Technical Considerations:**
- Keep Python logic layer intact (aggregations.py, rankings.py)
- Backend framework: TBD (FastAPI, Flask, Django, etc.)
- Frontend framework: TBD (React, Vue, Svelte, Next.js, etc.)
- Chart library: TBD (Plotly.js, Chart.js, D3.js, etc.)
- Deployment: TBD (Docker, serverless, traditional hosting)

**Migration Strategy:**
1. Extract business logic into standalone modules
2. Create API layer wrapping existing functions
3. Build frontend consuming API endpoints
4. Maintain same data flow and calculations
5. Preserve color palettes and styling

---

## Data Requirements

**Source Data Files:**
- `subramos_historico.parquet` or `subramos_historico.csv`
- Must include both accumulated and `_current` suffixed columns
- Minimum required columns: periodo, cod_cia, nombre_corto, ramo_nombre_corto, subramo_nombre_corto, primas_emitidas, primas_emitidas_current

**Data Quality:**
- Proper numeric types for metric columns
- Consistent company names (nombre_corto)
- Valid periodo format (YYYYQQ)
- No missing values in key dimensions

---

## Future Enhancements (Backlog)

### Dashboard Features
- [ ] Additional KPIs (siniestralidad ratio, combined ratio)
- [ ] Year-over-year and quarter-over-quarter variations
- [ ] Export functionality (Excel, PDF)
- [ ] Time series charts
- [ ] Drill-down capabilities

### Technical Improvements
- [ ] Database integration (PostgreSQL, MongoDB)
- [ ] User authentication and authorization
- [ ] Custom dashboard builder
- [ ] Scheduled data updates
- [ ] Advanced caching strategies

### Analytics
- [ ] Predictive models
- [ ] Trend analysis
- [ ] Comparative analysis tools
- [ ] Custom report generation

---

## Success Criteria

### Phase 1 (Prototype) ✅
- [x] Load and display historical data
- [x] Implement all required filters
- [x] Show accumulated and current data modes
- [x] Display KPIs and charts
- [x] Top-N company rankings
- [x] Dual color palettes for ramos/subramos
- [x] Responsive and styled interface
- [x] Documentation (README)

### Phase 2 (Web Application)
- [ ] Framework selection and setup
- [ ] API implementation with existing logic
- [ ] Frontend development
- [ ] Deployment and hosting
- [ ] User testing and feedback
- [ ] Performance optimization

---

## Notes

- The prototype validates all business logic before web migration
- Python aggregation functions are framework-agnostic and reusable
- Color palettes ensure visual distinction between ramos (many) and subramos (few)
- Fiscal calendar handling is critical for correct quarter mapping
- Current vs accumulated data toggle provides flexibility for different analysis needs
