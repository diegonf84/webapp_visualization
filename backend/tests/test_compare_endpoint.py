"""Tests for GET /api/data/companies/{cod_cia}/compare endpoint."""


def test_compare_total_percentile_returns_above_below(client):
    """R3: total_percentile returns selected, above, and below companies."""
    resp = client.get("/api/data/companies/B002/compare?method=total_percentile")
    assert resp.status_code == 200

    body = resp.json()
    assert body["method"] == "total_percentile"
    assert body["selected_company"]["cod_cia"] == "B002"
    assert body["selected_company"]["relative_position"] == 0
    assert body["periodo"] == "202404"
    assert body["total_companies_in_tipo"] == 3

    # B002 is mid-ranked: A001 above, C003 below
    above_codes = [c["cod_cia"] for c in body["companies_above"]]
    below_codes = [c["cod_cia"] for c in body["companies_below"]]
    assert "A001" in above_codes
    assert "C003" in below_codes


def test_compare_main_ramo_percentile_includes_ramo_metadata(client):
    """R4: main_ramo_percentile includes ramo name, percentage, and per-company ramo primas."""
    resp = client.get("/api/data/companies/B002/compare?method=main_ramo_percentile")
    assert resp.status_code == 200

    body = resp.json()
    assert body["method"] == "main_ramo_percentile"
    assert body["main_ramo"] is not None
    assert body["main_ramo_percentage"] is not None
    assert body["total_companies_with_ramo"] is not None

    # Selected company should have main_ramo_primas populated
    assert body["selected_company"]["main_ramo_primas"] is not None
    assert body["selected_company"]["main_ramo_primas"] > 0


def test_compare_ramo_similarity_returns_distance(client):
    """R5: ramo_similarity returns similar_companies sorted by ascending distance."""
    resp = client.get("/api/data/companies/A001/compare?method=ramo_similarity")
    assert resp.status_code == 200

    body = resp.json()
    assert body["method"] == "ramo_similarity"
    assert len(body["similar_companies"]) > 0

    # Verify ascending distance order
    distances = [c["similarity_distance"] for c in body["similar_companies"]]
    assert distances == sorted(distances)

    # Each similar company should have a similarity_distance
    for company in body["similar_companies"]:
        assert company["similarity_distance"] is not None
        assert company["similarity_distance"] >= 0
