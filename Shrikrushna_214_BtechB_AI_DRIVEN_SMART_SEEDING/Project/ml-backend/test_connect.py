import requests
try:
    print("Attempting to connect to http://localhost:5000/dropdowns...")
    response = requests.get("http://localhost:5000/dropdowns", timeout=5)
    with open('response.txt', 'w', encoding='utf-8') as f:
        f.write(f"Status Code: {response.status_code}\n")
        f.write(f"Response:\n{response.text}")
    print("Done")
except Exception as e:
    print(f"Connection failed: {e}")
