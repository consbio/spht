from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.timezone import now
from django.utils.deprecation import MiddlewareMixin

PREVIEW_MODE = getattr(settings, "PREVIEW_MODE", False)
PREVIEW_PASSWORD = getattr(settings, "PREVIEW_PASSWORD", "")
PREVIEW_EXPIRES = getattr(settings, "PREVIEW_EXPIRES", None)
INTERNAL_IPS = getattr(settings, "INTERNAL_IPS", ["127.0.0.1"])


class PreviewAccessMiddleware(MiddlewareMixin):
    """
    When PREVIEW_MODE = True in settings, requires users to provide a site-level password before accessing any part
    of the site.
    """

    def process_request(self, request):
        expired = False
        if PREVIEW_EXPIRES:
            expired = now() >= PREVIEW_EXPIRES

        internal = (
            request.META.get("HTTP_X_FORWARDED_FOR", request.META["REMOTE_ADDR"])
            in INTERNAL_IPS
        )

        if (
            not PREVIEW_MODE
            or request.session.get("authorized_for_preview", False)
            or expired
            or internal
        ):
            return
        elif request.POST.get("password") == PREVIEW_PASSWORD and PREVIEW_PASSWORD:
            request.session["authorized_for_preview"] = True
            return HttpResponseRedirect(request.path)
        else:
            return render(request, "preview_login.html", status=401)
