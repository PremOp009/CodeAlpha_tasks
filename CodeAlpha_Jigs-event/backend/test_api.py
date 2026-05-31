import requests

url = 'https://jigs-event.onrender.com/api/events/create'
data = {
    'title': 'Test Event',
    'description': 'Test',
    'category': 'tech',
    'date': '2026-06-01',
    'time': '10:00',
    'location': 'Test',
    'max_seats': 100,
}
files = {
    'image': ('test.jpg', b'dummy content', 'image/jpeg')
}

response = requests.post(url, data=data, files=files)
print(response.status_code)
print(response.json())
