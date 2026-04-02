# Stack Manifests

这里提供的是“按部署块聚合后的单文件清单”。

目标是让 Jenkins 任务只需要切换：

- 分支
- `STACK_FILE` 路径

就可以完成不同模块的部署。

## 三个部署块

- `k8s/stacks/blog-stack-portable.yaml`
  - MySQL
  - Halo

- `k8s/stacks/jenkins-stack-portable.yaml`
  - Jenkins

- `k8s/stacks/monitoring-stack-portable.yaml`
  - Prometheus
  - Grafana
  - node-exporter
  - kube-state-metrics

## 推荐 Jenkins 用法

统一使用：

- `Jenkinsfile.stack.portable`

在 Jenkins 任务里：

- 分支选对应代码分支
- Script Path 填：
  - `Jenkinsfile.stack.portable`
- 参数 `STACK_FILE` 填对应清单路径

例如：

- 博客基础栈：
  - `k8s/stacks/blog-stack-portable.yaml`
- Jenkins：
  - `k8s/stacks/jenkins-stack-portable.yaml`
- 监控栈：
  - `k8s/stacks/monitoring-stack-portable.yaml`

## 说明

这些 stack 文件面向“别人可以直接复现”的场景，因此：

- 默认不绑定固定节点名
- 默认依赖集群已有的 `StorageClass`
- 默认通过 `port-forward` 访问服务
- SMTP 邮件告警保持可选
