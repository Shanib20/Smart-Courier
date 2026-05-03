import urllib.request
import json

try:
    req = urllib.request.Request('http://127.0.0.1:8080/gateway/auth/login', 
                                 data=json.dumps({"email":"admin@example.com", "password":"admin123"}).encode('utf-8'),
                                 headers={'Content-Type': 'application/json'},
                                 method='POST')
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode())
    print("Login success:", data)
    
    token = data.get('token')
    if token:
        req2 = urllib.request.Request('http://127.0.0.1:8080/gateway/auth/admins',
                                      headers={'Authorization': f'Bearer {token}'},
                                      method='GET')
        res2 = urllib.request.urlopen(req2)
        print("Admins:", res2.read().decode())
except urllib.error.HTTPError as e:
    print("Failed:", e.code, e.read().decode())
except Exception as e:
    print("Error:", str(e))
