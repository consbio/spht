from django.core.management.base import BaseCommand, CommandError
from ncdjango.models import Service, Variable, SERVICE_DATA_ROOT
from django.db import transaction

import os
import os.path


class Command(BaseCommand):
    help = "Delete an ncdjango service"

    def add_arguments(self, parser):
        parser.add_argument("service_name")

    def handle(self, *args, **options):
        name = options["service_name"]
        with transaction.atomic():
            svc = Service.objects.get(name=name)
            Variable.objects.filter(service_id=svc.id).delete()
            path = svc.data_path
            svc.delete()
            os.remove(os.path.join(SERVICE_DATA_ROOT, path))
