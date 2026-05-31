import os; import django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jigs_events.settings'); django.setup()
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import QueryDict
from rest_framework.request import Request
from rest_framework.parsers import MultiPartParser
from django.test import RequestFactory
import io
import json

factory = RequestFactory()
request = factory.post('/api/events/create', {
    'title': 'Test',
    'highlights': json.dumps([]),
    'image': InMemoryUploadedFile(io.BytesIO(b'content'), 'image', 'test.jpg', 'image/jpeg', 7, None)
})
drf_request = Request(request, parsers=[MultiPartParser()])
data = drf_request.data

print("Type of data:", type(data))
print("Is QueryDict:", isinstance(data, QueryDict))
print("image type before copy:", type(data.get('image')))

if 'highlights' in data and isinstance(data['highlights'], str):
    mutable_data = data.copy() if hasattr(data, 'copy') else data
    mutable_data['highlights'] = json.loads(data['highlights'])
    data = mutable_data

print("image type after copy:", type(data.get('image')))
print("image value after copy:", data.get('image'))
