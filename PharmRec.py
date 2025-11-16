import requests
import json
import math
import urllib.parse
from typing import List, Dict


OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
Coordinates = {
    "latitude": 24.345942, 
    "longitude": 54.539434
}


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371  
    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)
    dlon, dlat = lon2_rad - lon1_rad, lat2_rad - lat1_rad
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def generate_google_maps_link(lat: float, lon: float) -> str:
    return f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"

def get_gps_location():
    return Coordinates["latitude"], Coordinates["longitude"]


def get_nearby_pharmacies(lat: float, lon: float, radius: int = 3000) -> List[Dict]:
    
    overpass_query = f"""
        [out:json][timeout:25];
        nwr[amenity=pharmacy](around:{radius},{lat},{lon});
        out center;
    """
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PharmacyReciCare' 
    }
    
    payload = {'data': overpass_query}

    try:
        response = requests.post(OVERPASS_API_URL, data=payload, headers=headers, timeout=25)
        response.raise_for_status() 
    except requests.exceptions.RequestException as e:
        print(f"Error{e}")
        return []

    data = response.json()
    results = data.get("elements", [])
    pharmacies = []
    
    for element in results:
        tags = element.get("tags", {})
        place_lat, place_lon = element.get("lat"), element.get("lon")

        place_name = tags.get("name") or tags.get("operator")
        if not place_lat or not place_lon or not place_name:
            continue
        
        distance_km = calculate_distance(lat, lon, place_lat, place_lon)
        maps_link = generate_google_maps_link(place_lat, place_lon)

        pharmacies.append({
            "Name": place_name,
            "Address": tags.get("addr:full", tags.get("addr:street", "Abu Dhabi, UAE")),
            "Opening Hours": tags.get("opening_hours", "9:00"),
            "Phone": tags.get("contact:phone", "N/A"),
            "Latitude": place_lat,"Longitude": place_lon,
            "Distance in Km": round(distance_km, 2),
            "Google Maps": maps_link
        })

    pharmacies.sort(key=lambda p: p["Distance in Km"])
    return pharmacies[:8]


if __name__ == "__main__":
    latitude, longitude = get_gps_location()

    results = get_nearby_pharmacies(latitude, longitude, radius=3000)

    if not results:
        print("No pharmacies found nearby")
    else:
        print("Pharmacies near you:")
        print(json.dumps(results, indent=2))