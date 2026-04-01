# halo-k8s-blog

Kubernetes-based Halo blog system with Jenkins CI/CD.

## Structure

- `Jenkinsfile`: Jenkins pipeline definition
- `assets`: static assets synchronized into Halo work directory
- `k8s/mysql`: MySQL manifests
- `k8s/halo`: Halo manifests
- `k8s/cicd/jenkins`: Jenkins manifests

## Current Scope

- Three-node Kubernetes deployment
- MySQL scheduled on `k8s-master-02`
- Halo scheduled on `k8s-master-01`
- Jenkins scheduled on `k8s-master-03`
- Jenkins updates Halo automatically through Kubernetes rollout
- Jenkins synchronizes repository assets into `/root/.halo2/assets`

## Assets Sync

Static files stored under `assets/` are copied into the Halo pod at `/root/.halo2/assets` during the Jenkins pipeline.
This is suitable for managed images, CSS files, and other repository-driven frontend resources.
