import requests
from bs4 import BeautifulSoup
from geopy.geocoders import Nominatim

def geocode_address(address):
    geolocator = Nominatim(user_agent="health_connect")
    try:
        location = geolocator.geocode(address, timeout=10)
        if location:
            return (location.latitude, location.longitude)
    except Exception as e:
        print(f"Geocoding error for {address}: {str(e)}")
    return (None, None)

def scrape_hospital_data(url):
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    hospitals = []

    # Locate all rows in the table
    rows = soup.find_all('tr')
    for row in rows:
        columns = row.find_all('td')  # Find all td elements in the row

        if len(columns) >= 5:  # Ensure there are enough columns
            hospital_name = columns[0].get_text(strip=True) if columns[0].has_attr('class') and 'column-1' in columns[0]['class'] else "N/A"
            county = columns[1].get_text(strip=True) if columns[1].has_attr('class') and 'column-2' in columns[1]['class'] else "N/A"
            sub_county = columns[2].get_text(strip=True) if columns[2].has_attr('class') and 'column-3' in columns[2]['class'] else "N/A"
            address = columns[3].get_text(strip=True) if columns[3].has_attr('class') and 'column-4' in columns[3]['class'] else "N/A"
            phone_number = columns[4].get_text(strip=True) if columns[4].has_attr('class') and 'column-5' in columns[4]['class'] else "N/A"

            lat, lng = geocode_address(address)
            hospitals.append({
                "name": hospital_name,
                "county": county,
                "sub_county": sub_county,
                "address": address,
                "phone_number": phone_number,
                "lat": lat,
                "lng": lng
            })

    return hospitals

if __name__ == "__main__":
    url = "https://mtiba.com/find-a-clinic-near-me/"  # Replace with the actual URL
    hospitals = scrape_hospital_data(url)
    print(hospitals)