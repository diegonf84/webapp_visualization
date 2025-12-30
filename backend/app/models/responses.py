from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# Filter options responses
class FilterOption(BaseModel):
    """Single filter option (value and optional label)."""
    value: str
    label: Optional[str] = None


class FiltersResponse(BaseModel):
    """Available filter values."""
    years: List[str] = Field(description="Available years")
    quarters: List[str] = Field(description="Available quarters (01, 02, 03, 04)")
    ramos: List[str] = Field(description="Available ramos")
    companies: List[str] = Field(description="Available company names")


# KPI responses
class KPIResponse(BaseModel):
    """KPI metrics response."""
    primas_emitidas: float = Field(description="Total issued premiums")
    primas_devengadas: float = Field(description="Total earned premiums")
    siniestros_devengados: float = Field(description="Total incurred claims")
    gastos_devengados: float = Field(description="Total incurred expenses")
    entities_count: int = Field(description="Number of entities with emissions")


# Company ranking response
class CompanyRankingItem(BaseModel):
    """Single company in ranking."""
    nombre_corto: str = Field(description="Company short name")
    ramo_nombre_corto: Optional[str] = Field(None, description="Ramo name (if applicable)")
    subramo_nombre_corto: Optional[str] = Field(None, description="Subramo name (if applicable)")
    primas_emitidas: float = Field(description="Issued premiums")


class CompanyRankingResponse(BaseModel):
    """Top N companies ranking."""
    companies: List[CompanyRankingItem]
    total: int = Field(description="Total number of companies before TOP-N filter")


# Distribution response
class DistributionItem(BaseModel):
    """Single item in distribution."""
    name: str = Field(description="Category name (ramo or subramo)")
    value: float = Field(description="Value (primas_emitidas)")
    percentage: Optional[float] = Field(None, description="Percentage of total")


class DistributionResponse(BaseModel):
    """Distribution by ramo or subramo."""
    items: List[DistributionItem]
    total: float = Field(description="Total value")


# Company list response (for selection page)
class CompanyListItem(BaseModel):
    """Company item for selection list."""
    cod_cia: str = Field(description="Company code")
    nombre_corto: str = Field(description="Company short name")
    tipo_cia: str = Field(description="Company type (Generales, Vida, etc.)")
    primas_emitidas: float = Field(description="Total issued premiums (latest period)")
    ramos_count: int = Field(description="Number of ramos the company operates in")


class CompanyListResponse(BaseModel):
    """List of companies for selection."""
    companies: List[CompanyListItem]
    total: int = Field(description="Total number of companies")


class RamoBreakdownItem(BaseModel):
    """Single ramo in portfolio breakdown."""
    ramo: str = Field(description="Ramo name")
    primas: float = Field(description="Issued premiums")
    percentage: float = Field(description="Percentage of total")
    primas_devengadas: float = Field(description="Earned premiums")
    siniestros_devengados: float = Field(description="Incurred claims")
    gastos_devengados: float = Field(description="Incurred expenses")
    siniestralidad: float = Field(description="Siniestralidad ratio (%)")
    gastos_percent: float = Field(description="Gastos ratio (%)")
    combined_ratio: float = Field(description="Combined ratio (%)")


class CompanyProfileResponse(BaseModel):
    """Single company profile with KPIs from latest period."""
    cod_cia: str = Field(description="Company code")
    nombre_corto: str = Field(description="Company short name")
    tipo_cia: str = Field(description="Company type")
    periodo: str = Field(description="Period of the data (YYYYQQ)")
    ramos_count: int = Field(description="Number of ramos")
    # Ranking position
    ranking_position: int = Field(description="Company ranking by primas emitidas")
    total_companies: int = Field(description="Total number of companies in ranking")
    # Accumulated metrics
    primas_emitidas: float = Field(description="Issued premiums (accumulated)")
    primas_devengadas: float = Field(description="Earned premiums (accumulated)")
    siniestros_devengados: float = Field(description="Incurred claims (accumulated)")
    gastos_devengados: float = Field(description="Incurred expenses (accumulated)")
    # Results from otros_conceptos
    resultado_tecnico: float = Field(description="Technical result")
    resultado_financiero: float = Field(description="Financial result")
    resultado_final: float = Field(description="Final result (tecnico + financiero)")
    # YoY variations (None if not calculable - new company, zero division, >1000%)
    yoy_primas_emitidas: Optional[float] = Field(None, description="YoY variation primas emitidas (%)")
    yoy_resultado_tecnico: Optional[float] = Field(None, description="YoY variation resultado tecnico (%)")
    yoy_resultado_financiero: Optional[float] = Field(None, description="YoY variation resultado financiero (%)")
    yoy_resultado_final: Optional[float] = Field(None, description="YoY variation resultado final (%)")
    # Current period metrics (for monthly average = divide by 3)
    primas_emitidas_current: float = Field(description="Issued premiums (current quarter)")
    primas_devengadas_current: float = Field(description="Earned premiums (current quarter)")
    siniestros_devengados_current: float = Field(description="Incurred claims (current quarter)")
    gastos_devengados_current: float = Field(description="Incurred expenses (current quarter)")
    # Top 5 ramos
    top_ramos: List[RamoBreakdownItem] = Field(description="Top 5 ramos by primas")
    # Market averages (same tipo_cia)
    market_siniestralidad: float = Field(description="Market average siniestralidad (same tipo_cia)")
    market_gastos_percent: float = Field(description="Market average gastos % (same tipo_cia)")
    market_combined_ratio: float = Field(description="Market average combined ratio (same tipo_cia)")
    market_companies_count: int = Field(description="Number of companies in the market group")


# Health check
class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    version: str = "1.0.0"
