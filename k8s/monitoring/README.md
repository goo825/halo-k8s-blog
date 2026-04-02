# Monitoring Stack

This directory contains a lightweight monitoring stack for the three-node Halo K8s cluster.

## Placement

- `Prometheus`: `k8s-master-03`
- `Grafana`: `k8s-master-03`
- `kube-state-metrics`: `k8s-master-03`
- `node-exporter`: all nodes via `DaemonSet`

## Files

- `prometheus-grafana-node03.yaml`: namespace, RBAC, PV/PVC, Prometheus, Grafana, and kube-state-metrics
- `node-exporter.yaml`: DaemonSet and headless Service for node metrics

## Access

- Prometheus: NodePort `30900`
- Grafana: NodePort `30901`

## Suggested apply order

```bash
mkdir -p /data/prometheus /data/grafana
kubectl apply -f k8s/monitoring/prometheus-grafana-node03.yaml
kubectl apply -f k8s/monitoring/node-exporter.yaml
```

## Default Grafana credentials

- Username: `admin`
- Password: `admin`
