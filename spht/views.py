import math
import mercantile
import pyproj
from PIL import Image
from django.views.generic.base import View
from trefoil.geometry.bbox import BBox
from trefoil.render.renderers.unique import UniqueValuesRenderer
from trefoil.utilities.color import Color
from django.http import HttpResponse
from functools import reduce

from ncdjango.geoimage import GeoImage
from ncdjango.models import Service
from ncdjango.views import GetImageViewBase
from pyproj import Proj

TILE_SIZE = (256, 256)
RENDERER = UniqueValuesRenderer([(1, Color(158, 202, 225))], fill_value=0)
WGS84 = Proj('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')
WEB_MERCATOR = Proj(
    '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
)


class IntersectView(GetImageViewBase):
    def dispatch(self, request, *args, **kwargs):
        self.service = None
        return View.dispatch(self, request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        tile_bounds = list(mercantile.bounds(int(self.kwargs['x']), int(self.kwargs['y']), int(self.kwargs['z'])))
        extent = BBox(tile_bounds, projection=WGS84).project(WEB_MERCATOR)

        try:
            service_names = request.GET['services'].split(',')
        except KeyError:
            return HttpResponse(status=400)

        grids = []

        for service_name in service_names:
            self.service = Service.objects.get(name=service_name)
            variable = self.service.variable_set.all()[:1].get()

            native_extent = extent.project(pyproj.Proj(str(variable.projection)))
            dimensions = self.get_grid_spatial_dimensions(variable)

            cell_size = (
                float(variable.full_extent.width) / dimensions[0],
                float(variable.full_extent.height) / dimensions[1]
            )

            grid_bounds = [
                int(math.floor(float(native_extent.xmin - variable.full_extent.xmin) / cell_size[0])) - 1,
                int(math.floor(float(native_extent.ymin - variable.full_extent.ymin) / cell_size[1])) - 1,
                int(math.ceil(float(native_extent.xmax - variable.full_extent.xmin) / cell_size[0])) + 1,
                int(math.ceil(float(native_extent.ymax - variable.full_extent.ymin) / cell_size[1])) + 1
            ]

            grid_bounds = [
                min(max(grid_bounds[0], 0), dimensions[0]),
                min(max(grid_bounds[1], 0), dimensions[1]),
                min(max(grid_bounds[2], 0), dimensions[0]),
                min(max(grid_bounds[3], 0), dimensions[1])
            ]

            if not (grid_bounds[2] - grid_bounds[0] and grid_bounds[3] - grid_bounds[1]):
                continue

            grid_extent = BBox((
                variable.full_extent.xmin + grid_bounds[0] * cell_size[0],
                variable.full_extent.ymin + grid_bounds[1] * cell_size[1],
                variable.full_extent.xmin + grid_bounds[2] * cell_size[0],
                variable.full_extent.ymin + grid_bounds[3] * cell_size[1]
            ), native_extent.projection)

            if not self.is_y_increasing(variable):
                y_max = dimensions[1] - grid_bounds[1]
                y_min = dimensions[1] - grid_bounds[3]
                grid_bounds[1] = y_min
                grid_bounds[3] = y_max

            grids.append(self.get_grid_for_variable(
                variable, x_slice=(grid_bounds[0], grid_bounds[2]),
                y_slice=(grid_bounds[1], grid_bounds[3])
            ))
            self.close_dataset()

            intersection = reduce(lambda x, y: x & y, grids)

            image = RENDERER.render_image(intersection, row_major_order=self.is_row_major(variable)).convert('RGBA')

            #  If y values are increasing, the rendered image needs to be flipped vertically
            if self.is_y_increasing(variable):
                image = image.transpose(Image.FLIP_TOP_BOTTOM)

        image = GeoImage(image, grid_extent).warp(extent, TILE_SIZE).image
        image, content_type = self.format_image(image, 'png')

        return self.create_response(request, image, content_type)

