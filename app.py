from flask import Flask, jsonify, render_template, request
import scrape_hospital_data

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/hospitals', methods=['GET'])
def get_hospitals():
    hospitals = scrape_hospital_data.scrape_hospital_data_with_selenium("https://mtiba.com/find-a-clinic-near-me/")
    return jsonify(hospitals)

if __name__ == '__main__':
    app.run(debug=True, port=5000)