import asyncio
from itertools import islice

import aiohttp
import copy
import mercantile
from django.core.management import BaseCommand
from ncdjango.models import Service
from pyproj import Proj
from django.conf import settings

ZOOM_LEVELS = list(range(7))
WGS84 = Proj('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')
TILE_URL = 'http://127.0.0.1/tiles/{service}/{z}/{x}/{y}.png'
MAX_CONCURRENCY = 10


class Command(BaseCommand):
    help = 'Warm the nginx tile cache for slower, low zoom levels'

    async def fetch_tile(self, session, service, tile):
        try:
            host = settings.ALLOWED_HOSTS[0]
        except IndexError:
            host = '127.0.0.1'

        headers = {'host': host}
        await session.get(TILE_URL.format(service=service, z=tile.z, x=tile.x, y=tile.y), headers=headers)

    async def fetch_tiles(self, tiles):
        async with aiohttp.ClientSession() as session:
            coroutines = (self.fetch_tile(session, *t) for t in tiles)
            futures = set([asyncio.ensure_future(c) for c in islice(coroutines, 0, MAX_CONCURRENCY)])

            while True:
                await asyncio.sleep(.1)
                for f in copy.copy(futures):
                    if f.done():
                        futures.remove(f)
                        try:
                            futures.add(asyncio.ensure_future(next(coroutines)))
                        except StopIteration:
                            continue

    def handle(self, *args, **kwargs):
        tiles = []
        for service in Service.objects.all():
            extent = service.full_extent.project(WGS84)
            tiles += [
                (service.name, t) for t in
                mercantile.tiles(extent.xmin, extent.ymin, extent.xmax, extent.ymax, ZOOM_LEVELS, truncate=True)
            ]

        asyncio.get_event_loop().run_until_complete(self.fetch_tiles(tiles))
