// frontend/script.js

const map = L.map("map").setView([12.90, 80.20], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(map);

let zones = [];
let zoneCircles = {};
let completedZones = [];
let disasterStarted = false;

// We will use a variable for the backend URL so it's easy to change later when deploying.
const BACKEND_URL = "https://relieefnet-ai.onrender.com";

// ---------------- PAGE LOAD ----------------
window.onload = async function () {
    try {
        const res = await fetch(`${BACKEND_URL}/areas`);
        zones = await res.json();
        updateTopStats();
        populateDropdowns();
    } catch (e) {
        alert("🚨 Backend not connected! Please run backend/app.py");
    }
};

// ---------------- TOP BAR COUNTS ----------------
function updateTopStats() {

    document.getElementById("zones").innerText = zones.length;

    let people = zones.reduce((sum, z) => sum + z.people, 0);
    document.getElementById("people").innerText = people;

    let critical = zones.filter(z => z.priority > 2500).length;
    document.getElementById("critical").innerText = critical;
}

// ---------------- START DISASTER ----------------
function startDisaster() {

    disasterStarted = true;
    completedZones = [];

    // remove old circles if any
    for (let key in zoneCircles) {
        map.removeLayer(zoneCircles[key]);
    }

    zoneCircles = {};

    zones.forEach(z => {

        let color = "green";

        if (z.priority > 2500) color = "red";
        else if (z.priority > 1800) color = "orange";

        const circle = L.circle([z.lat, z.lon], {
            color: color,
            fillColor: color,
            fillOpacity: 0.45,
            radius: 500
        }).addTo(map);

        circle.bindPopup(`
            <b>${z.name}</b><br>
            🔴 Affected Area<br><br>
            👶 Children: ${z.children}<br>
            👩 Women: ${z.women}<br>
            👴 Elderly: ${z.elderly}<br>
            🚑 Patients: ${z.patients}<br>
            ⚠ Priority: ${z.priority}
        `);

        zoneCircles[z.name] = circle;
    });

    alert("🚨 Disaster Started");
}

// ---------------- DROPDOWN ----------------
function populateDropdowns() {

    const donor = document.getElementById("donor");
    const receiver = document.getElementById("receiver");

    donor.innerHTML = `<option value="">Select Donor Zone</option>`;
    receiver.innerHTML = `<option value="">Select Receiver Zone</option>`;

    zones.forEach(z => {

        donor.innerHTML += `<option value="${z.name}">${z.name}</option>`;
        receiver.innerHTML += `<option value="${z.name}">${z.name}</option>`;
    });
}

// ---------------- DRONE ----------------
function deployDrone() {

    if (!disasterStarted) {
        alert("Start disaster first");
        return;
    }

    const remaining = zones.filter(z => !completedZones.includes(z.name));

    if (remaining.length === 0) {
        alert("All zones completed");
        return;
    }

    remaining.sort((a, b) => b.priority - a.priority);

    const target = remaining[0];

    zoneCircles[target.name].setStyle({
        color: "orange",
        fillColor: "orange"
    });

    const start = [12.90, 80.20];
    const end = [target.lat, target.lon];

    const drone = L.marker(start).addTo(map);

    const line = L.polyline([start, end], {
        color: "blue",
        weight: 4
    }).addTo(map);

    let i = 0;

    const move = setInterval(() => {

        i += 0.02;

        drone.setLatLng([
            start[0] + (end[0] - start[0]) * i,
            start[1] + (end[1] - start[1]) * i
        ]);

        if (i >= 1) {

            clearInterval(move);

            zoneCircles[target.name].setStyle({
                color: "green",
                fillColor: "green"
            });

            completedZones.push(target.name);

            map.removeLayer(drone);
            map.removeLayer(line);

            alert("🚁 Delivered to " + target.name);
        }

    }, 100);
}

// ---------------- DONATE ----------------
async function donate() {
    if (!disasterStarted) {
        alert("Start disaster first");
        return;
    }
    const donor = document.getElementById("donor").value;
    const receiver = document.getElementById("receiver").value;
    if (!donor || !receiver) {
        alert("Select both zones");
        return;
    }
    if (donor === receiver) {
        alert("Choose different zones");
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/donate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ donor: donor, receiver: receiver })
        });
        const data = await res.json();

        zoneCircles[donor].setStyle({ color: "orange", fillColor: "orange" });
        zoneCircles[receiver].setStyle({ color: "green", fillColor: "green" });

        alert("🤝 " + data.message);
    } catch (e) {
        alert("Failed to connect to backend for donation.");
    }
}


// ---------------- OTHER ----------------
async function sendSMS() {
    try {
        const res = await fetch(`${BACKEND_URL}/sms`, { method: "POST" });
        const data = await res.json();
        alert("📩 " + data.message);
    } catch (e) {
        alert("Failed to send SMS.");
    }
}

async function ngo() {
    try {
        const res = await fetch(`${BACKEND_URL}/ngo`);
        const data = await res.json();
        alert("🏥 NGO Connected: " + data.ngo);
    } catch (e) {
        alert("Failed to connect to NGO.");
    }
}

async function allocate() {
    try {
        const res = await fetch(`${BACKEND_URL}/allocate`);
        const data = await res.json();
        alert(data.message);
    } catch (e) {
        alert("Failed to connect to allocate route.");
    }
}