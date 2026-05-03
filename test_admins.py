import jwt
import time
import urllib.request
import json
import base64

# Secret from application.yml
SECRET_B64 = 'dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yc21hcnRjb3VyaWVy'
SECRET = base64.b64decode(SECRET_B64)

# Generate token
payload = {
    'sub': 'admin@example.com',
    'role': 'ADMIN',
    'userId': 1,
    'iat': int(time.time()),
    'exp': int(time.time()) + 86400
}

token = jwt.encode(payload, SECRET, algorithm='HS256')

try:
    req = urllib.request.Request('http://127.0.0.1:8080/gateway/auth/admins',
                                  headers={'Authorization': f'Bearer {token}'},
                                  method='GET')
    res = urllib.request.urlopen(req)
    print("Admins:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Failed:", e.code, e.read().decode())
except Exception as e:
    print("Error:", str(e))
