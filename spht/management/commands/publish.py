from django.core.management.base import BaseCommand, CommandError
from ncdjango.models import Service, Variable, SERVICE_DATA_ROOT
from django.db import transaction
import clover.geometry.bbox as cbb
import clover.netcdf.describe
from clover.utilities.color import Color
from clover.render.renderers.stretched import StretchedRenderer
import pyproj

import os.path
import shutil
import json

class Command(BaseCommand):
    help = 'Publish an ncdjango service'

    def add_arguments(self, parser):
        parser.add_argument('data_file')
        parser.add_argument('variable_name')

    def handle(self, *args, **options):
        data_file = options['data_file']
        variable_name = options['variable_name']

        if not os.path.isdir(SERVICE_DATA_ROOT):
            raise CommandError('Directory %s does not exist.' % SERVICE_DATA_ROOT)

        # Check for existence of file or service. There's a possible race
        # condition here, but this is a management command, not a user command.
        file_exists = False
        svc_exists = False

        target = os.path.join(SERVICE_DATA_ROOT, os.path.basename(data_file))
        if os.path.exists(target):
            self.stderr.write('File %s already exists.\n' % target)
            file_exists = True

        svc_name = os.path.basename(data_file).split('.')[0]
        try:
            svc = Service.objects.get(name=svc_name)
            self.stderr.write('Service %s already exists.\n' % svc_name)
            svc_exists = True
        except Service.DoesNotExist:
            pass

        if file_exists or svc_exists:
            raise CommandError('No changes made.')

        desc = clover.netcdf.describe.describe(data_file)
        grid = desc['variables'][variable_name]['spatial_grid']
        extent = grid['extent']
        proj = extent['proj4']
        bbox = clover.geometry.bbox.BBox([extent[c] for c in ['xmin', 'xmax', 'ymin', 'ymax']], pyproj.Proj(proj))
        renderer = StretchedRenderer([(1, Color(0, 0, 0, 255)), (0, Color(255, 255, 255, 0))])

        service_data = {
            'name': svc_name,
            'projection': proj,
            'full_extent': bbox,
            'initial_extent': bbox,
            'supports_time': 0,
            'render_top_layer_only': 1
            }

        variable_data = {
            'index': 1,
            'variable': variable_name,
            'projection': proj,
            'x_dimension': grid['x_dimension'],
            'y_dimension': grid['y_dimension'],
            'name': svc_name,
            'renderer': renderer,
            'full_extent': bbox,
            'supports_time': 0
            }

        shutil.copy(data_file, SERVICE_DATA_ROOT)
        with transaction.atomic():
            service_data['data_path'] = os.path.basename(data_file)
            variable_data['service'] = Service.objects.create(**service_data)
            Variable.objects.create(**variable_data)
