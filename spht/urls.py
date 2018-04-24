from django.conf.urls import url
from django.views.generic import TemplateView

from spht.views import IntersectView

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='spht/tool.html')),
    url(r'^intersect/tiles/(?P<z>\d+)/(?P<x>\d+)/(?P<y>\d+).png$', IntersectView.as_view())
]
