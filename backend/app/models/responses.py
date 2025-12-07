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


# Health check
class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    version: str = "1.0.0"
