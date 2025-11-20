from fastapi import APIRouter, Query
from pharmacy.PharmRec import get_nearby_pharmacies

router = APIRouter(prefix="/pharmacy", tags=["pharmacy"])

@router.get("/nearby")
def nearby_pharmacies(
    lat: float = Query(..., description="Latitude of user"),
    lon: float = Query(..., description="Longitude of user"),
    radius: int = Query(3000, description="Search radius in meters"),
):
    pharmacies = get_nearby_pharmacies(lat, lon, radius)
    return {"pharmacies": pharmacies}