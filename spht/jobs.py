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
from trefoil.render.renderers.unique import UniqueValuesRenderer
from trefoil.utilities.color import Color
from weasyprint import HTML

TILE_SIZE = 256
WGS84 = Proj("+proj=longlat +datum=WGS84 +no_defs +type=crs")
WEB_MERCATOR = Proj(
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs"
)
IMAGE_SIZE = (645, 430)

SPECIES_LABELS = {
    "pinucon": "Lodgepole Pine",
    "picesit": "Sitka Spruce",
    "pseumen": "Douglas-fir",
    "pinupon": "Ponderosa Pine",
    "piceeng": "Engelmann Spruce",
    "lariocc": "Western larch",
    "pinumon": "Western white pine",
    "tsughet": "Western hemlock",
}


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
        crop_distance = "50" if species == "pinupon" else "500"

        self.service = Service.objects.get(
            name="{}_cna_v750_normal_{}_10x_crop_{}".format(
                species, historic, crop_distance
            )
        )
        variable = self.service.variable_set.all().first()
        native_extent = extent.project(Proj(str(variable.projection)))
        dimensions = self.get_grid_spatial_dimensions(variable)

        cell_size = (
            float(variable.full_extent.width) / dimensions[0],
            float(variable.full_extent.height) / dimensions[1],
        )

        grid_bounds = [
            int(
                math.floor(
                    float(native_extent.xmin - variable.full_extent.xmin) / cell_size[0]
                )
            )
            - 1,
            int(
                math.floor(
                    float(native_extent.ymin - variable.full_extent.ymin) / cell_size[1]
                )
            )
            - 1,
            int(
                math.ceil(
                    float(native_extent.xmax - variable.full_extent.xmin) / cell_size[0]
                )
            )
            + 1,
            int(
                math.ceil(
                    float(native_extent.ymax - variable.full_extent.ymin) / cell_size[1]
                )
            )
            + 1,
        ]

        grid_bounds = [
            min(max(grid_bounds[0], 0), dimensions[0]),
            min(max(grid_bounds[1], 0), dimensions[1]),
            min(max(grid_bounds[2], 0), dimensions[0]),
            min(max(grid_bounds[3], 0), dimensions[1]),
        ]

        if not (grid_bounds[2] - grid_bounds[0] and grid_bounds[3] - grid_bounds[1]):
            return GeoImage(Image.new("RGBA", size), native_extent)

        grid_extent = BBox(
            (
                variable.full_extent.xmin + grid_bounds[0] * cell_size[0],
                variable.full_extent.ymin + grid_bounds[1] * cell_size[1],
                variable.full_extent.xmin + grid_bounds[2] * cell_size[0],
                variable.full_extent.ymin + grid_bounds[3] * cell_size[1],
            ),
            native_extent.projection,
        )

        if not self.is_y_increasing(variable):
            y_max = dimensions[1] - grid_bounds[1]
            y_min = dimensions[1] - grid_bounds[3]
            grid_bounds[1] = y_min
            grid_bounds[3] = y_max

        historic_data = self.get_grid_for_variable(
            variable,
            x_slice=(grid_bounds[0], grid_bounds[2]),
            y_slice=(grid_bounds[1], grid_bounds[3]),
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
                    name="{}_cna_v750_8gcms_{}_10x_crop_{}".format(
                        species, future, crop_distance
                    )
                )
                variable = self.service.variable_set.all().first()
                future_grids.append(
                    self.get_grid_for_variable(
                        variable,
                        x_slice=(grid_bounds[0], grid_bounds[2]),
                        y_slice=(grid_bounds[1], grid_bounds[3]),
                    )
                )
                self.close_dataset()
            future_data = sum(future_grids)
            del future_grids

            data = numpy.zeros_like(historic_data, numpy.int8)

            data[historic_data == 1] = 1
            kept_idx = (historic_data == 1) & (future_data > 0)
            data[kept_idx] = future_data[kept_idx] + 1
            gained_idx = (historic_data == 0) & (future_data > 0)
            data[gained_idx] = future_data[gained_idx] + len(kept_colors) + 1

            print(f"{numpy.unique(historic_data == 0)=}")
            print(f"{numpy.unique(future_data > 0)=}")
            print(f"{numpy.unique(future_data)=}")
            print(f"{numpy.unique(future_data[gained_idx])=}")

            data[data.mask == 1] = 0

            print(f"{data.min()=}")
            print(f"{data.max()=}")

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

            print(f"{renderer.colormap=}")

        image = renderer.render_image(
            data.data, row_major_order=self.is_row_major(variable)
        ).convert("RGBA")

        #  If y values are increasing, the rendered image needs to be flipped vertically
        if self.is_y_increasing(variable):
            image = image.transpose(Image.FLIP_TOP_BOTTOM)

        return (
            GeoImage(image, grid_extent).warp(extent.project(WEB_MERCATOR), size).image
        )

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
                {"rcp": rcp.upper(), "year": year.replace("_", " - ")}
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
