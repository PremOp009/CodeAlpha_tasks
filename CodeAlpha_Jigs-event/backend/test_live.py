import requests
import json
import io

url_login = 'https://jigs-event.onrender.com/api/auth/login'
res = requests.post(url_login, json={'email': 'organizerbot@example.com', 'password': 'SuperSecretPassword!123'})
token = res.json().get('access')

url_create = 'https://jigs-event.onrender.com/api/events/create'
headers = {'Authorization': f'Bearer {token}'}

# Construct multipart manually to guarantee order: FILE then STRING
from requests_toolbelt.multipart.encoder import MultipartEncoder

m = MultipartEncoder(
    fields={
        'title': 'Test Event',
        'description': 'Test',
        'category': 'tech',
        'date': '2026-06-01',
        'time': '10:00',
        'location': 'Test',
        'max_seats': '100',
        'highlights': '[]',
        'image': ('test.jpg', b'dummy content', 'image/jpeg'),
        'image': 'late string'
    }
)
# Wait, dicts can't have duplicate keys. Need a list of tuples.
fields = [
    ('title', 'Test Event'),
    ('description', 'Test'),
    ('category', 'tech'),
    ('date', '2026-06-01'),
    ('time', '10:00'),
    ('location', 'Test'),
    ('max_seats', '100'),
    ('highlights', '[]'),
    ('image', ('test.jpg', b'dummy content', 'image/jpeg')),
    ('image', 'late string')
]
m = MultipartEncoder(fields=fields)

headers['Content-Type'] = m.content_type
res = requests.post(url_create, headers=headers, data=m)
print(res.json())
