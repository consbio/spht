from django.core.management.base import BaseCommand, CommandError
from ncdjango.models import Service, Variable, SERVICE_DATA_ROOT
from django.db import transaction

import os.path
import shutil
import json

class Command(BaseCommand):
    help = 'Publish an ncdjango service'

    def add_arguments(self, parser):
        parser.add_argument('data_file')
        parser.add_argument('service_json')
        parser.add_argument('variable_json')

    def handle(self, *args, **options):
	# should check file suffix and check for destination conflicts...
        data_file = options['data_file']
        shutil.copy(data_file, SERVICE_DATA_ROOT)

        with open(options['service_json'], 'r') as f:
            service_data = json.loads(f.read())

        with open(options['variable_json'], 'r') as f:
            variable_data = json.loads(f.read())

        # should check for conflicts
        with transaction.atomic():
            service_data['data_path'] = os.path.basename(data_file)
            svc = Service(**service_data)
            svc.save()
            variable_data['service_id'] = svc.id
            Variable(**variable_data).save()
        
