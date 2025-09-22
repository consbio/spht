import asyncio
import math
import os
from asyncio import ensure_future
from base64 import b64encode
from io import BytesIO
from uuid import uuid4

import aiohttp
import mercantile
import numpy
from PIL import Image
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.timezone import now
from geopy.distance import geodesic
from ncdjango.geoimage import world_to_image, GeoImage, image_to_world
from ncdjango.geoprocessing.params import (
    StringParameter,
    ListParameter,
    IntParameter,
    NumberParameter,
)
from ncdjango.geoprocessing.workflow import Task
from ncdjango.models import Service
from ncdjango.views import NetCdfDatasetMixin
from pyproj import Proj, transform
from trefoil.geometry.bbox import BBox
from trefoil.netcdf.variable import SpatialCoordinateVariables
from trefoil.render.renderers.unique import UniqueValuesRenderer
from trefoil.utilities.color import Color
from weasyprint import HTML

TILE_SIZE = 256
WGS84 = Proj("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
WEB_MERCATOR = Proj(
    "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
)
IMAGE_SIZE = (645, 430)

SPECIES_LABELS = {
    "pico": "Lodgepole Pine",
    "pisi": "Sitka Spruce",
    "psme": "Douglas-fir",
    "pipo": "Ponderosa Pine",
    "pien": "Engelmann Spruce",
    "lariocc": "Western larch",
    "pinumon": "Western white pine",
}

RCP_LABELS = {"rcp45": "RCP 4.5", "rcp85": "RCP 8.5"}

YEAR_LABELS = {"2025": "2011 - 2040", "2055": "2041 - 2070", "2085": "2071 - 2100"}


class ReportTask(NetCdfDatasetMixin, Task):
    inputs = [
        ListParameter(NumberParameter(""), "bounds", required=True),
        IntParameter("zoom", required=True),
        StringParameter("basemap", required=True),
        StringParameter("single_color", required=True),
        ListParameter(StringParameter(""), "kept_colors", required=True),
        ListParameter(StringParameter(""), "gained_colors", required=True),
        StringParameter("species", required=True),
        StringParameter("historic", required=True),
        ListParameter(StringParameter(""), "futures", required=False),
        NumberParameter("opacity", required=False),
    ]

    outputs = [StringParameter("url")]

    def __init__(self, *args, **kwargs):
        self.service = None
        self.dataset = None

        Task.__init__(self, *args, **kwargs)

    def get_images_dir(self):
        return os.path.join(os.path.dirname(__file__), "static", "images")

    def get_colors(self, ramp, count):
        colors = [ramp[math.ceil(i * len(ramp) / count)] for i in range(count)]
        colors[-1] = ramp[-1]
        return colors

    def get_basemap_image(self, basemap, bounds, size, zoom):
        tiles = list(mercantile.tiles(*bounds, zoom, truncate=True))
        bounds_merc = [*mercantile.xy(*bounds[:2]), *mercantile.xy(*bounds[2:])]
        image = Image.new("RGBA", size)
        to_image = world_to_image(BBox(bounds_merc, projection=WEB_MERCATOR), size)

        async def fetch_tile(client, url, tile):
            tile_bounds = mercantile.xy_bounds(tile)

            if url.startswith("//"):
                url = "https:" + url

            async with client.get(
                url.format(x=tile.x, y=tile.y, z=tile.z, s="server")
            ) as r:
                tile_im = Image.open(BytesIO(await r.read()))
                image.paste(
                    tile_im, [int(round(x)) for x in to_image(*tile_bounds[0:4:3])]
                )  # [0:4:3] = [xmin, ymax] (upper-left)

        async def fetch_tiles():
            async with aiohttp.ClientSession() as client:
                futures = [
                    ensure_future(fetch_tile(client, basemap, tile)) for tile in tiles
                ]
                await asyncio.wait(futures, return_when=asyncio.ALL_COMPLETED)

        asyncio.run(fetch_tiles())
        return image

    def get_results_image(
        self,
        bounds,
        size,
        single_color,
        kept_colors,
        gained_colors,
        species,
        historic,
        futures,
    ):
        kept_colors = self.get_colors(kept_colors, len(futures) + 1)
        gained_colors = self.get_colors(gained_colors, len(futures) + 1)

        extent = BBox(bounds, projection=WGS84)
        self.service = Service.objects.get(
            name="{}_p{}_800m_pa".format(species, historic)
        )
        variable = self.service.variable_set.all().first()
        native_extent = extent.project(Proj(str(variable.projection)))

        coords = SpatialCoordinateVariables.from_bbox(
            variable.full_extent, *self.get_grid_spatial_dimensions(variable)
        )
        x_slice = coords.x.indices_for_range(native_extent.xmin, native_extent.xmax)
        y_slice = coords.y.indices_for_range(native_extent.ymin, native_extent.ymax)

        historic_data = self.get_grid_for_variable(
            variable, x_slice=x_slice, y_slice=y_slice
        )
        self.close_dataset()

        if not futures:
            data = historic_data
            renderer = UniqueValuesRenderer(
                [(1, Color.from_hex(single_color))], fill_value=0
            )
        else:
            future_grids = []
            for future in futures:
                self.service = Service.objects.get(
                    name="{}_15gcm_{}_pa".format(species, future)
                )
                variable = self.service.variable_set.all().first()
                future_grids.append(
                    self.get_grid_for_variable(
                        variable, x_slice=x_slice, y_slice=y_slice
                    )
                )
                self.close_dataset()
            future_data = sum(future_grids)
            del future_grids

            data = numpy.zeros_like(historic_data, numpy.uint8)

            data[historic_data == 1] = 1
            kept_idx = (historic_data == 1) & (future_data > 0)
            data[kept_idx] = future_data[kept_idx] + 1
            gained_idx = (historic_data == 0) & (future_data > 0)
            data[gained_idx] = future_data[gained_idx] + len(kept_colors) + 1

            data[data.mask == 1] = 0

            values = numpy.unique(data)
            renderer = UniqueValuesRenderer(
                [
                    (i + 1, Color.from_hex(c))
                    for (i, c) in enumerate(kept_colors)
                    if i + 1 in values
                ]
                + [
                    (i + len(kept_colors) + 1, Color.from_hex(c))
                    for (i, c) in enumerate(gained_colors)
                    if i + len(kept_colors) + 1 in values
                ],
                fill_value=0,
            )

        image = renderer.render_image(data.data).convert("RGBA")
        return GeoImage(image, native_extent).warp(extent, size).image

    def execute(
        self,
        bounds,
        zoom,
        basemap,
        single_color,
        kept_colors,
        gained_colors,
        species,
        **kwargs,
    ):
        historic = kwargs["historic"]
        futures = kwargs.get("futures", [])
        opacity = kwargs.get("opacity", 1.0)

        map_image = self.get_basemap_image(basemap, bounds, IMAGE_SIZE, zoom)
        results_image = self.get_results_image(
            bounds,
            IMAGE_SIZE,
            single_color,
            kept_colors,
            gained_colors,
            species,
            historic,
            futures,
        )
        map_image.paste(
            Image.blend(map_image, results_image, opacity), (0, 0), results_image
        )
        image_data = BytesIO()
        map_image.save(image_data, "png")

        def format_x_coord(x):
            return (
                "{}&deg; W".format(round(abs(x), 2))
                if x < 0
                else "{}&deg; E".format(round(x, 2))
            )

        def format_y_coord(y):
            return (
                "{}&deg; S".format(round(abs(y), 2))
                if y < 0
                else "{}&deg; N".format(round(y, 2))
            )

        to_world = image_to_world(
            BBox(bounds, projection=WGS84).project(WEB_MERCATOR), IMAGE_SIZE
        )

        images_dir = self.get_images_dir()
        with open(os.path.join(images_dir, "scale.png"), "rb") as f:
            scale_data = b64encode(f.read()).decode()

        scale_bar_x = 38
        scale_bar_y = IMAGE_SIZE[1] - 15

        scale_bar_start = transform(
            WEB_MERCATOR, WGS84, *to_world(scale_bar_x, scale_bar_y)
        )
        scale_bar_end = transform(
            WEB_MERCATOR, WGS84, *to_world(scale_bar_x + 96, scale_bar_y)
        )
        scale = "{} mi".format(
            round(geodesic(reversed(scale_bar_start), reversed(scale_bar_end)).miles, 1)
        )

        context = {
            "today": now(),
            "image_data": b64encode(image_data.getvalue()).decode(),
            "east": format_x_coord(bounds[0]),
            "south": format_y_coord(bounds[1]),
            "west": format_x_coord(bounds[2]),
            "north": format_y_coord(bounds[3]),
            "scale_image_data": scale_data,
            "scale": scale,
            "single_color": single_color,
            "kept_colors": self.get_colors(kept_colors, len(futures) + 1),
            "gained_colors": self.get_colors(gained_colors, len(futures) + 1),
            "historic": historic.replace("_", "-"),
            "futures": [
                {"rcp": RCP_LABELS[rcp], "year": YEAR_LABELS[year]}
                for rcp, year in [x.split("_", 1) for x in futures]
            ],
            "species": SPECIES_LABELS[species],
        }

        uuid = str(uuid4())
        report_dir = os.path.join(settings.MEDIA_ROOT, uuid)
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)
        path = os.path.join(report_dir, "SPHT Report.pdf")
        with open(path, "wb") as f:
            HTML(
                BytesIO(render_to_string("spht/report.html", context).encode())
            ).write_pdf(f)

        return "{}{}/SPHT Report.pdf".format(settings.MEDIA_URL, uuid)
