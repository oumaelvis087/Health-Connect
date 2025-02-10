import json
import os
from functools import lru_cache
from typing import List, Dict, Any

def validate_hospital(hospital: dict) -> bool:
    required_fields = ['name', 'lat', 'lng', 'address', 'phone']
    try:
        if not all(field in hospital for field in required_fields):
            return False
        float(hospital['lat'])
        float(hospital['lng'])
        return True
    except (ValueError, KeyError):
        return False

@lru_cache(maxsize=1)
def get_hospitals() -> List[Dict[str, Any]]:
    """Load and validate hospitals from JSON file"""
    hospital_path = os.path.join('data', 'hospitals.json')
    try:
        with open(hospital_path, 'r') as f:
            hospitals = json.load(f)['hospitals']
            return [h for h in hospitals if validate_hospital(h)]
    except (json.JSONDecodeError, KeyError, FileNotFoundError) as e:
        raise ValueError(f"Invalid hospital data: {str(e)}")

@lru_cache(maxsize=1)
def get_ambulances() -> List[Dict[str, Any]]:
    """Load ambulances from JSON file with caching."""
    ambulance_path = os.path.join('data', 'ambulances.json')
    with open(ambulance_path, 'r') as f:
        return json.load(f)['ambulances']

def reverse_geocode(lat: float, lng: float) -> dict:
    """Mock reverse geocoding function that returns sub-county and region info
    TODO: Replace with actual geocoding implementation using:
    - OpenStreetMap Nominatim
    - Google Maps Reverse Geocoding
    - Local geographic dataset"""
    
    # This is a mock implementation - replace with real API calls
    return {
        'sub_county': 'Nairobi West',
        'region': 'Nairobi'
    }