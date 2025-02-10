from flask import Flask, jsonify, render_template, request
from utils import get_hospitals, get_ambulances, reverse_geocode
from math import radians, sin, cos, sqrt, atan2

app = Flask(__name__)

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate accurate distance using Haversine formula with validation
    Returns distance in kilometers
    """
    # Validate coordinate ranges
    if not (-90 <= lat1 <= 90 and -180 <= lon1 <= 180 and
            -90 <= lat2 <= 90 and -180 <= lon2 <= 180):
        raise ValueError("Invalid coordinates")

    R = 6371  # Earth radius in kilometers
    
    # Convert degrees to radians
    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula components
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/hospitals')
def get_hospital_data():
    try:
        user_lat = float(request.args.get('lat'))
        user_lng = float(request.args.get('lng'))
        if not (-90 <= user_lat <= 90) or not (-180 <= user_lng <= 180):
            return jsonify({"error": "Invalid location coordinates"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid location coordinates"}), 400

    # Get user's sub-county
    location_info = reverse_geocode(user_lat, user_lng)
    user_sub_county = location_info.get('sub_county', '').lower()

    try:
        hospitals = get_hospitals()
    except Exception as e:
        app.logger.error(f"Error loading hospital data: {str(e)}")
        return jsonify({"error": "Server error"}), 500

    valid_hospitals = []
    for hospital in hospitals:
        try:
            hosp_lat = float(hospital['lat'])
            hosp_lng = float(hospital['lng'])
            distance = calculate_distance(user_lat, user_lng, hosp_lat, hosp_lng)
            
            hospital_data = {
                **hospital,
                'distance': distance,
                'same_sub_county': (hospital.get('sub_county', '').lower() == user_sub_county)
            }
            
            # Prioritize same sub-county within 50km or expand search
            if distance <= 50 or hospital_data['same_sub_county']:
                valid_hospitals.append(hospital_data)

        except (KeyError, ValueError, TypeError) as e:
            app.logger.warning(f"Skipping invalid hospital data: {hospital.get('id')} - {str(e)}")
            continue

    # Sort by same sub-county first, then distance
    valid_hospitals.sort(key=lambda x: (-x['same_sub_county'], x['distance']))
    return jsonify(valid_hospitals[:20])

@app.route('/ambulances')
def get_ambulance_data():
    # Similar implementation as hospitals endpoint
    pass

@app.route('/location-info')
def get_location_info():
    try:
        user_lat = float(request.args.get('lat'))
        user_lng = float(request.args.get('lng'))
        location_info = reverse_geocode(user_lat, user_lng)
        return jsonify({
            'sub_county': location_info.get('sub_county', 'Unknown Area'),
            'region': location_info.get('region', 'Unknown Region')
        })
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid coordinates"}), 400

if __name__ == '__main__':
    app.run(debug=True)