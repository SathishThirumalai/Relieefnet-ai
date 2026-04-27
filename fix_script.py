import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix window.onload
content = re.sub(
    r'window\.onload\s*=\s*async\s*function\s*\(\)\s*\{[^\}]+\};',
    '''window.onload = async function () {
    try {
        const res = await fetch("http://127.0.0.1:5000/areas");
        zones = await res.json();
        updateTopStats();
        populateDropdowns();
    } catch (e) {
        alert("🚨 Backend not connected! Please run backend/app.py");
    }
};''',
    content,
    flags=re.DOTALL
)

# Fix donate()
content = re.sub(
    r'function donate\(\) \{.*?(?=\s*// \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\- OTHER \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-)',
    '''async function donate() {
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
        const res = await fetch("http://127.0.0.1:5000/donate", {
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
''',
    content,
    flags=re.DOTALL
)

# Fix sendSMS()
content = re.sub(
    r'function sendSMS\(\) \{.*?\}',
    '''async function sendSMS() {
    try {
        const res = await fetch("http://127.0.0.1:5000/sms", { method: "POST" });
        const data = await res.json();
        alert("📩 " + data.message);
    } catch (e) {
        alert("Failed to send SMS.");
    }
}''',
    content,
    flags=re.DOTALL
)

# Fix ngo()
content = re.sub(
    r'function ngo\(\) \{.*?\}',
    '''async function ngo() {
    try {
        const res = await fetch("http://127.0.0.1:5000/ngo");
        const data = await res.json();
        alert("🏥 NGO Connected: " + data.ngo);
    } catch (e) {
        alert("Failed to connect to NGO.");
    }
}''',
    content,
    flags=re.DOTALL
)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script.js successfully")
