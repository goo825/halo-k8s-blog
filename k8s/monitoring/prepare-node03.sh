#!/bin/sh
set -eu

mkdir -p /data/prometheus /data/grafana
chmod 777 /data/prometheus /data/grafana

echo "Prepared /data/prometheus and /data/grafana on $(hostname)"
