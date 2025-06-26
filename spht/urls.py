from django.urls import re_path
from django.views.generic import TemplateView

from spht.views import IntersectView

urlpatterns = [
    re_path(r'^$', TemplateView.as_view(template_name='spht/tool.html')),
    re_path(r'^intersect/tiles/(?P<z>\d+)/(?P<x>\d+)/(?P<y>\d+).png$', IntersectView.as_view())
]
