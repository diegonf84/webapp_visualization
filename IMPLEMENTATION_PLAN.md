# Implementation Plan - Insurance Metrics Dashboard

## Project Overview
Web application for visualizing insurance metrics in Argentina, based on historical data from the Superintendencia de Seguros de la Nacion.

**Current Status:** Phase 2C (React Frontend + Docker + Deployment) - COMPLETED
**Deployed:** Render Blueprint ready for production deployment

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

## Phase 2: Backend API Development ✅ COMPLETED

### Strategy: Gradual Migration to Modern Web Stack

**Decision Rationale:**
- Build backend API first to decouple business logic from UI
- Continue with 1-2 more Plotly Dash dashboards to validate requirements
- Migrate to modern web stack (React) for professional appearance and long-term scalability
- Gradual approach minimizes risk while building foundation for future

### Recommended Technology Stack

**Backend: FastAPI (Python)**
- **Why FastAPI:**
  - Leverages existing Python expertise
  - Fast, modern, async support
  - Auto-generates interactive API documentation (Swagger/OpenAPI)
  - Type hints improve code quality
  - Easy to deploy and scale

**Frontend: React + TypeScript**
- **Why React:**
  - Industry standard with massive ecosystem
  - Professional, modern appearance
  - Component reusability across multiple dashboards
  - Excellent performance for complex interactions
  - Highly transferable skill

- **Why TypeScript:**
  - Type safety catches errors early
  - Better IDE support and autocomplete
  - Easier refactoring and maintenance

**Chart Libraries:**
- **Primary: Nivo** (React-native charting library)
  - Beautiful defaults out-of-the-box
  - Responsive and animated
  - Good for standard charts (bar, line, pie, donut)
  - Easier learning curve, great documentation

- **Secondary: Apache ECharts** (for advanced features)
  - More powerful and configurable
  - Complex visualizations (heatmaps, gauges, sankey)
  - Use when Nivo limitations are reached

**UI Component Library:**
- **Options:**
  - **shadcn/ui** - Modern, customizable, built on Radix UI
  - **Ant Design** - Comprehensive, professional, battle-tested
  - **Material-UI (MUI)** - Popular, extensive components

**Styling:**
- **TailwindCSS** - Utility-first, rapid development, modern approach

**Deployment:**
- Backend: Docker container, cloud hosting (AWS, GCP, Azure)
- Frontend: Static hosting (Vercel, Netlify) or same container as backend

### Phase 2A: Backend API ✅ COMPLETED

**Goal:** Extract business logic into RESTful API while keeping Dash app functional

**API Endpoints:**
```
GET  /api/health                    # Health check
GET  /api/filters/years             # Available years
GET  /api/filters/quarters          # Available quarters
GET  /api/filters/ramos             # Available ramos
GET  /api/filters/companies         # Available companies

GET  /api/data/kpis                 # KPI totals
     ?year=2024&quarter=01&ramo=Automotores&view_mode=accumulated

GET  /api/data/companies/ranking    # Top N companies data
     ?year=2024&quarter=01&ramo=&top_n=15&view_mode=accumulated

GET  /api/data/distribution/ramos   # Ramo distribution
     ?year=2024&quarter=01&view_mode=accumulated

GET  /api/data/distribution/subramos # Subramo distribution
     ?year=2024&quarter=01&ramo=Automotores&view_mode=accumulated
```

**Project Structure:**
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── api/
│   │   ├── routes/
│   │   │   ├── filters.py   # Filter endpoints
│   │   │   └── data.py      # Data endpoints
│   │   └── dependencies.py  # Shared dependencies
│   ├── core/
│   │   ├── config.py        # Configuration
│   │   └── loader.py        # Data loader (from Phase 1)
│   ├── logic/               # Reuse from Phase 1
│   │   ├── aggregations.py
│   │   └── rankings.py
│   └── models/
│       ├── requests.py      # Request models
│       └── responses.py     # Response models
├── requirements.txt
└── Dockerfile
```

**Technical Requirements:**
- Reuse existing `aggregations.py` and `rankings.py` without modification
- Pydantic models for request validation and response serialization
- CORS configuration for frontend access
- Query parameter validation
- Error handling and logging
- Optional: Response caching for performance

**Success Criteria:**
- [x] FastAPI server running with all endpoints
- [x] Existing Dash app can call API instead of direct data access (`app_api.py`)
- [x] API documentation auto-generated and accessible (`/docs`)
- [x] Same business logic, zero regression
- [x] Response times < 500ms for typical queries

### Phase 2B: Additional Dash Dashboards (Optional)

**Goal:** Build 1-2 more dashboards using new API backend

**Potential Dashboards:**
- Time series analysis (line charts over periods)
- Ratio analysis (siniestralidad, combined ratio)
- Comparative analysis (company vs market)

**Benefits:**
- Validates API design with real use cases
- Identifies missing endpoints or data needs
- Builds more features while learning React in parallel

### Phase 2C: React Frontend + Docker + Deployment ✅ COMPLETED

**Goal:** Rebuild existing dashboard(s) in React with modern UX and Docker deployment

**Completed Features:**
1. React + TypeScript + Vite project setup
2. Nivo charts (stacked bar chart, donut chart)
3. Filter components (Year, Quarter, Ramo, View Mode, Top N)
4. 6 KPI cards with dynamic formatting (M/B notation)
5. Docker Compose orchestration (frontend + backend)
6. S3 data loading support with in-memory caching
7. Render Blueprint deployment configuration

**Project Structure:**
```
webapp_visualization/
├── docker-compose.yml       # Docker orchestration
├── render.yaml              # Render deployment blueprint
├── .env                     # Environment variables
├── frontend/
│   ├── Dockerfile           # Multi-stage build with nginx
│   ├── nginx.conf           # Reverse proxy to backend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── filters/     # Filter components
│   │   │   ├── charts/      # Nivo chart components
│   │   │   ├── kpis/        # KPI card components
│   │   │   └── layout/      # Header, Footer
│   │   ├── hooks/           # React Query hooks
│   │   ├── services/        # API client (axios)
│   │   ├── types/           # TypeScript interfaces
│   │   └── lib/             # Utils & constants
│   └── package.json
├── backend/
│   ├── Dockerfile           # Python with uv
│   └── app/
│       ├── main.py          # FastAPI with lifespan preload
│       ├── core/
│       │   ├── config.py    # S3 & local config
│       │   └── loader.py    # S3/local data loader
│       └── ...
└── data/                    # Local data files
```

**Success Criteria:**
- [x] Feature parity with Dash version
- [x] Professional appearance with modern UI
- [x] Responsive design (mobile, tablet, desktop)
- [x] Smooth interactions and loading states
- [x] Consistent color palettes (ramos/subramos)
- [x] Docker Compose local deployment
- [x] S3 data source support
- [x] Render Blueprint for cloud deployment

### Gradual Migration Timeline

**Phase 2A (Backend API):** 1-2 weeks
- Focus on extracting and exposing business logic via REST API
- Validates API design before committing to frontend framework
- Dash app can optionally use API (hybrid approach)

**Learning Phase (Parallel to 2B):** 1-2 weeks
- Learn React fundamentals with tutorial projects
- Experiment with Nivo charts
- Get comfortable with TypeScript and modern tooling

**Phase 2B (Optional Dashboards):** 1-3 weeks
- Build 1-2 additional dashboards in Plotly Dash using the API
- Discover missing features or API improvements needed
- Continue learning React in parallel

**Phase 2C (React Migration):** 2-4 weeks
- Rebuild market overview dashboard in React
- Reference existing Dash implementation for requirements
- Iteratively improve UX and polish

**Total Estimated Timeline:** 5-10 weeks (varies based on scope and learning pace)

### Why This Approach Works

1. **Always have working code** - Dash version remains functional throughout
2. **API is not wasted work** - Required for React version anyway
3. **Learn with safety net** - Build React skills before committing fully
4. **Discover issues early** - API validation happens before heavy frontend investment
5. **Flexibility** - Can pause at any phase and reassess

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

### Phase 2A (Backend API) ✅
- [x] FastAPI project setup with proper structure
- [x] Implement all filter endpoints
- [x] Implement all data endpoints (KPIs, rankings, distributions)
- [x] Pydantic models for requests and responses
- [x] CORS and error handling
- [x] Auto-generated API documentation
- [ ] Integration testing (optional enhancement)

### Phase 2B (Optional Dash Dashboards)
- [ ] Time series analysis dashboard
- [ ] Ratio analysis dashboard
- [ ] Validate API design with real usage

### Phase 2C (React Frontend + Docker + Deployment) ✅
- [x] React + TypeScript + Vite setup
- [x] Implement chart components with Nivo
- [x] Rebuild market overview dashboard
- [x] State management with React Query
- [x] Responsive design and UX improvements
- [x] Docker Compose orchestration
- [x] S3 data loading support
- [x] Render Blueprint deployment

---

## Notes

- The prototype validates all business logic before web migration
- Python aggregation functions are framework-agnostic and reusable
- Color palettes ensure visual distinction between ramos (many) and subramos (few)
- Fiscal calendar handling is critical for correct quarter mapping
- Current vs accumulated data toggle provides flexibility for different analysis needs
