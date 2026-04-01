# halo-k8s-blog

Kubernetes-based Halo blog system with Jenkins CI/CD.

## Structure

- `Jenkinsfile`: Jenkins pipeline definition
- `k8s/mysql`: MySQL manifests
- `k8s/halo`: Halo manifests
- `k8s/cicd/jenkins`: Jenkins manifests

## Current Scope

- Three-node Kubernetes deployment
- MySQL scheduled on `k8s-master-02`
- Halo scheduled on `k8s-master-01`
- Jenkins scheduled on `k8s-master-03`
- Jenkins updates Halo automatically through Kubernetes rollout
