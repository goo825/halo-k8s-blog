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
- `node03-prepare.yaml`: one-shot Job that prepares `/data/prometheus` and `/data/grafana` on `k8s-master-03`
- `prepare-node03.sh`: manual fallback script for preparing the `k8s-master-03` host directories
- `Jenkinsfile.monitoring`: Jenkins pipeline for one-click monitoring deployment

## Access

- Prometheus: NodePort `30900`
- Grafana: NodePort `30901`

## Suggested apply order

```bash
kubectl apply -f k8s/monitoring/node03-prepare.yaml
kubectl wait --for=condition=complete job/monitoring-node03-prepare -n monitoring-system --timeout=120s
kubectl apply -f k8s/monitoring/prometheus-grafana-node03.yaml
kubectl apply -f k8s/monitoring/node-exporter.yaml
```

## Jenkins usage

Create a Jenkins pipeline job with:

- Repository URL: `https://github.com/goo825/halo-k8s-blog.git`
- Branch: your monitoring branch
- Pipeline script from SCM
- Script Path: `Jenkinsfile.monitoring`

Then click `Build Now` to deploy the full monitoring stack.

## Default Grafana credentials

- Username: `admin`
- Password: `admin`
