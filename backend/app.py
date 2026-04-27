# backend/app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__, static_folder="../", static_url_path="/")
CORS(app)

@app.route("/")
def index():
    return app.send_static_file("index.html")

areas = [
{
"name":"Zone A",
"lat":12.905,
"lon":80.205,
"people":1200,
"children":250,
"women":420,
"elderly":180,
"patients":90,
"resources":700
},
{
"name":"Zone B",
"lat":12.895,
"lon":80.225,
"people":900,
"children":180,
"women":300,
"elderly":110,
"patients":50,
"resources":300
},
{
"name":"Zone C",
"lat":12.885,
"lon":80.185,
"people":1500,
"children":320,
"women":520,
"elderly":250,
"patients":140,
"resources":80
},
{
"name":"Zone D",
"lat":12.915,
"lon":80.215,
"people":1000,
"children":220,
"women":340,
"elderly":150,
"patients":70,
"resources":500
}
]

def calc_priority(a):
    return (
        a["people"] +
        a["children"] * 2 +
        a["women"] * 2 +
        a["elderly"] * 4 +
        a["patients"] * 8 -
        a["resources"]
    )

@app.route("/areas")
def get_areas():

    result = []

    for a in areas:
        x = a.copy()
        x["priority"] = calc_priority(a)
        result.append(x)

    return jsonify(result)

@app.route("/allocate")
def allocate():

    sorted_areas = sorted(areas, key=calc_priority, reverse=True)

    top = sorted_areas[0]

    return jsonify({
        "message": f"Send emergency resources immediately to {top['name']}"
    })

@app.route("/donate", methods=["POST"])
def donate():

    data = request.json

    donor = data["donor"]
    receiver = data["receiver"]

    return jsonify({
        "status":"success",
        "message":f"Resources moved from {donor} to {receiver}"
    })

@app.route("/sms", methods=["POST"])
def sms():
    return jsonify({
        "status":"sent",
        "message":"Emergency alert SMS delivered"
    })

@app.route("/ngo")
def ngo():
    ngos = [
        "Red Cross",
        "Helping Hands",
        "Rapid Rescue NGO",
        "City Relief Team"
    ]

    return jsonify({
        "ngo": random.choice(ngos)
    })

if __name__ == "__main__":
    app.run(debug=True)