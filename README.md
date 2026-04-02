# halo-k8s-blog

Kubernetes-based Halo blog system with Jenkins CI/CD.

## Structure

- `Jenkinsfile`: Jenkins pipeline definition
- `Jenkinsfile.monitoring`: monitoring pipeline definition
- `theme/halo-k8s-theme`: repository-managed Halo theme package
- `k8s/mysql`: MySQL manifests
- `k8s/halo`: Halo manifests
- `k8s/cicd/jenkins`: Jenkins manifests
- `k8s/monitoring`: Prometheus and Grafana monitoring manifests

## Current Scope

- Three-node Kubernetes deployment
- MySQL scheduled on `k8s-master-02`
- Halo scheduled on `k8s-master-01`
- Jenkins scheduled on `k8s-master-03`
- Jenkins updates Halo automatically through Kubernetes rollout
- Jenkins publishes the repository theme into `/root/.halo2/themes/halo-k8s-theme`
- Prometheus and Grafana are scheduled on `k8s-master-03`
- node-exporter runs on all nodes to collect host metrics

## Theme Publish

The repository includes a minimal Halo theme package under `theme/halo-k8s-theme`.
During the Jenkins pipeline, this directory is copied into the Halo pod at `/root/.halo2/themes/halo-k8s-theme`.
After the first publish, enable the `halo-k8s-theme` theme in the Halo admin console so later Git commits can update frontend templates and styles through Jenkins.
