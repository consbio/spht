#!/usr/bin/env bash

source $HOME/venv/spht/bin/activate

cd $HOME/apps/spht
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py warm_tile_cache