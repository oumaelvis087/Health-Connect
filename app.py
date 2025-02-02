from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

# Simulated database (in a real application, use a proper database)
ambulances = []
hospitals = []
health_records = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/ambulances', methods=['GET'])
def get_ambulances():
    # In a real application, this would query a database
    return jsonify(ambulances)

@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    # In a real application, this would query a database
    return jsonify(hospitals)

@app.route('/api/vitals', methods=['POST'])
def save_vitals():
    data = request.json
    user_id = data.get('user_id', 'default')  # In a real app, get this from authentication
    if user_id not in health_records:
        health_records[user_id] = []
    health_records[user_id].append({
        'bp': data.get('bp'),
        'heart_rate': data.get('heart_rate'),
        'timestamp': data.get('timestamp')
    })
    return jsonify({'status': 'success'})

@app.route('/api/symptoms', methods=['POST'])
def check_symptoms():
    symptoms = request.json.get('symptoms', '')
    # In a real application, this would query a medical API or database
    # For now, return a simple response
    return jsonify({
        'recommendation': 'Please consult a healthcare professional for accurate diagnosis.',
        'severity': 'unknown'
    })

if __name__ == '__main__':
    # Load some sample data
    with open('data/ambulances.json', 'r') as f:
        ambulances = json.load(f)
    with open('data/hospitals.json', 'r') as f:
        hospitals = json.load(f)
    
    app.run(debug=True)