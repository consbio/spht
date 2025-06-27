import asyncio
from itertools import islice

import aiohttp
import mercantile
from django.conf import settings
from django.core.management import BaseCommand
from ncdjango.models import Service
from pyproj import Proj

ZOOM_LEVELS = list(range(7))
WGS84 = Proj("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
TILE_URL = "http://127.0.0.1/tiles/{service}/{z}/{x}/{y}.png"
MAX_CONCURRENCY = 10


class Command(BaseCommand):
    help = "Warm the nginx tile cache for slower, low zoom levels"

    async def fetch_tile(self, session, service, tile):
        try:
            host = settings.ALLOWED_HOSTS[0]
        except IndexError:
            host = "127.0.0.1"

        headers = {"host": host, "x-forwarded-proto": "https"}
        await session.get(
            TILE_URL.format(service=service, z=tile.z, x=tile.x, y=tile.y),
            headers=headers,
        )

    async def fetch_tiles(self, tiles):
        async with aiohttp.ClientSession() as session:
            coroutines = (self.fetch_tile(session, *t) for t in tiles)
            futures = []

            while True:
                futures += [
                    asyncio.ensure_future(c)
                    for c in islice(coroutines, 0, MAX_CONCURRENCY - len(futures))
                ]
                if not futures:
                    break

                await asyncio.wait(futures, return_when=asyncio.FIRST_COMPLETED)
                futures = [f for f in futures if not f.done()]

    def handle(self, *args, **kwargs):
        tiles = []
        for service in Service.objects.all():
            extent = service.full_extent.project(WGS84)
            tiles += [
                (service.name, t)
                for t in mercantile.tiles(
                    extent.xmin,
                    extent.ymin,
                    extent.xmax,
                    extent.ymax,
                    ZOOM_LEVELS,
                    truncate=True,
                )
            ]

        asyncio.get_event_loop().run_until_complete(self.fetch_tiles(tiles))
