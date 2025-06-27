import shutil

import os.path
import pyproj
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from ncdjango.models import Service, Variable, SERVICE_DATA_ROOT
from trefoil.geometry.bbox import BBox
from trefoil.netcdf.describe import describe
from trefoil.render.renderers.unique import UniqueValuesRenderer
from trefoil.utilities.color import Color


class Command(BaseCommand):
    help = "Publish an ncdjango service"

    def add_arguments(self, parser):
        parser.add_argument("data_files", nargs="+", type=str)
        parser.add_argument("--overwrite", action="store_true", dest="overwrite")

    def handle(self, data_files, overwrite, *args, **options):
        with transaction.atomic():
            for data_file in data_files:
                if not os.path.isdir(SERVICE_DATA_ROOT):
                    raise CommandError(
                        "Directory %s does not exist." % SERVICE_DATA_ROOT
                    )

                # Check for existence of file or service. There's a possible race
                # condition here, but this is a management command, not a user command.
                file_exists = False
                svc_exists = False

                target = os.path.join(SERVICE_DATA_ROOT, os.path.basename(data_file))
                if os.path.exists(target):
                    if not overwrite:
                        self.stderr.write("File %s already exists.\n" % target)
                    file_exists = True

                svc_name = os.path.basename(data_file).split(".")[0]
                if Service.objects.filter(name=svc_name).exists():
                    if overwrite:
                        Service.objects.filter(name=svc_name).delete()
                    else:
                        self.stderr.write("Service %s already exists.\n" % svc_name)
                        svc_exists = True

                if (file_exists or svc_exists) and not overwrite:
                    raise CommandError("No changes made.")

                desc = describe(data_file)
                grid = next(
                    v["spatial_grid"]
                    for k, v in desc["variables"].items()
                    if v.get("spatial_grid")
                )
                extent = grid["extent"]
                proj = extent["proj4"]
                bbox = BBox(
                    [extent[c] for c in ["xmin", "ymin", "xmax", "ymax"]],
                    pyproj.Proj(proj),
                )
                renderer = UniqueValuesRenderer(
                    [(1, Color(0, 0, 0, 255))], fill_value=0
                )

                if file_exists:
                    os.remove(
                        os.path.join(SERVICE_DATA_ROOT, os.path.basename(data_file))
                    )
                shutil.copy(data_file, SERVICE_DATA_ROOT)

                service = Service.objects.create(
                    name=svc_name,
                    projection=proj,
                    full_extent=bbox,
                    initial_extent=bbox,
                    data_path=os.path.basename(data_file),
                )

                for i, (variable_name, variable) in enumerate(
                    desc["variables"].items()
                ):
                    grid = variable.get("spatial_grid")
                    if grid is None:
                        continue

                    extent = grid["extent"]
                    bbox = BBox(
                        [extent[c] for c in ["xmin", "ymin", "xmax", "ymax"]],
                        pyproj.Proj(extent["proj4"]),
                    )

                    Variable.objects.create(
                        service=service,
                        index=i,
                        variable=variable_name,
                        projection=proj,
                        x_dimension=grid["x_dimension"],
                        y_dimension=grid["y_dimension"],
                        name=variable_name,
                        renderer=renderer,
                        full_extent=bbox,
                    )
