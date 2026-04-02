# halo-k8s-theme

This is a minimal Halo theme package stored in the same repository as the K8s and Jenkins manifests.

## Purpose

- Keep frontend theme files under version control
- Let Jenkins publish the theme package into Halo
- Demonstrate that frontend changes can be released without rebuilding the Halo image

## Directory layout

- `theme.yaml`: Halo theme metadata
- `settings.yaml`: Theme settings exposed in Halo
- `templates/`: Thymeleaf templates and static assets

## Jenkins publish target

The Jenkins pipeline publishes this directory to:

`/root/.halo2/themes/halo-k8s-theme`

inside the running Halo pod.

After the first publish, enable the `halo-k8s-theme` theme in the Halo admin console.
