"""
WSGI config for jigs_events project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jigs_events.settings')
application = get_wsgi_application()
