# Portable Deployment

这套说明面向“别人拿到仓库后直接复现”的场景。

和当前仓库里原有的节点绑定版相比，portable 版做了这些调整：

- 去掉固定 `k8s-master-01/02/03` 节点名
- 去掉对 `/data/...` 本地目录和手工 `PV` 的硬依赖
- 去掉固定 Node IP 输出
- 统一使用集群默认 `StorageClass` 为 PVC 动态分配存储
- 统一通过 `kubectl port-forward` 访问 Halo、Prometheus、Grafana
- SMTP 邮件告警保持可选

## 适用前提

- 集群已安装可用的默认 `StorageClass`
- 已有可用的 `kubectl` 上下文
- 如果要使用 Jenkins，Jenkins 需要能够执行 `kubectl`

## 可直接部署的清单

- `k8s/mysql/mysql-portable.yaml`
- `k8s/halo/halo-portable.yaml`
- `k8s/monitoring/prometheus-grafana-portable.yaml`
- `k8s/monitoring/node-exporter.yaml`

## 手动部署顺序

```bash
kubectl apply -f k8s/mysql/mysql-portable.yaml
kubectl rollout status statefulset/mysql -n blog-system --timeout=300s

kubectl apply -f k8s/halo/halo-portable.yaml
kubectl rollout status deployment/halo -n blog-system --timeout=300s

kubectl apply -f k8s/monitoring/prometheus-grafana-portable.yaml
kubectl apply -f k8s/monitoring/node-exporter.yaml
kubectl rollout status deployment/prometheus -n monitoring-system --timeout=300s
kubectl rollout status deployment/grafana -n monitoring-system --timeout=300s
kubectl rollout status deployment/kube-state-metrics -n monitoring-system --timeout=300s
```

## 访问方式

Halo：

```bash
kubectl -n blog-system port-forward svc/halo 8090:8090
```

打开：

```text
http://127.0.0.1:8090
```

Prometheus：

```bash
kubectl -n monitoring-system port-forward svc/prometheus 9090:9090
```

Grafana：

```bash
kubectl -n monitoring-system port-forward svc/grafana 3000:3000
```

打开：

```text
http://127.0.0.1:3000
```

Grafana 默认账号：

- 用户名：`admin`
- 密码：`admin`

## Jenkins 可复现入口

如果对方已经有 Jenkins，可直接使用：

- `Jenkinsfile.bootstrap.portable`
- `Jenkinsfile.monitoring.portable`
- `Jenkinsfile.stack.portable`

这样可以把博客基础栈和监控栈分别接入对方自己的 Jenkins。

如果希望把仓库按“三大部署块”来操作，推荐直接使用：

- `k8s/stacks/blog-stack-portable.yaml`
- `k8s/stacks/jenkins-stack-portable.yaml`
- `k8s/stacks/monitoring-stack-portable.yaml`

配合：

- `Jenkinsfile.stack.portable`

这样 Jenkins 任务只需要切换 `STACK_FILE` 参数即可。

### 统一 Stack 流水线配置

如果想让三大块都复用同一个 Jenkins 任务模板，推荐这样配置：

- 任务类型：`Pipeline`
- Definition：`Pipeline script from SCM`
- SCM：`Git`
- Repository URL：
  - `https://github.com/goo825/halo-k8s-blog.git`
- Branches to build：
  - `*/codex/monitoring-cicd-module`
- Script Path：
  - `Jenkinsfile.stack.portable`

然后在 Jenkins 参数里只改：

- `STACK_FILE=k8s/stacks/blog-stack-portable.yaml`
- `STACK_FILE=k8s/stacks/jenkins-stack-portable.yaml`
- `STACK_FILE=k8s/stacks/monitoring-stack-portable.yaml`

分别对应三大块部署。

### Jenkins 配置流程

以下流程适用于“对方已经有自己的 Jenkins，并且 Jenkins 所在环境可以执行 `kubectl`”。

当前 portable 文件位于分支：

- `codex/monitoring-cicd-module`

如果后续这些文件被合并到主分支，再把下面的分支从 `codex/monitoring-cicd-module` 改成 `main` 即可。

### 任务 1：部署博客基础栈

用途：

- 自动部署 MySQL
- 自动部署 Halo

Jenkins 新建任务时建议：

- 任务类型：`Pipeline`
- 任务名称：`halo-bootstrap-portable`

General：

- 可选勾选 `GitHub project`
- Project url：
  - `https://github.com/goo825/halo-k8s-blog`

Pipeline：

- Definition：`Pipeline script from SCM`
- SCM：`Git`
- Repository URL：
  - `https://github.com/goo825/halo-k8s-blog.git`
- Branches to build：
  - `*/codex/monitoring-cicd-module`
- Script Path：
  - `Jenkinsfile.bootstrap.portable`

保存后点击：

- `Build Now`

构建成功后，Jenkins 会：

1. 部署 `k8s/mysql/mysql-portable.yaml`
2. 等待 MySQL 就绪
3. 部署 `k8s/halo/halo-portable.yaml`
4. 等待 Halo 就绪
5. 在控制台提示如何用 `port-forward` 访问 Halo

### 任务 2：部署监控栈

用途：

- 自动部署 Prometheus
- 自动部署 Grafana
- 自动部署 kube-state-metrics
- 自动部署 node-exporter

Jenkins 新建任务时建议：

- 任务类型：`Pipeline`
- 任务名称：`halo-monitoring-portable`

Pipeline：

- Definition：`Pipeline script from SCM`
- SCM：`Git`
- Repository URL：
  - `https://github.com/goo825/halo-k8s-blog.git`
- Branches to build：
  - `*/codex/monitoring-cicd-module`
- Script Path：
  - `Jenkinsfile.monitoring.portable`

保存后点击：

- `Build Now`

构建成功后，Jenkins 会：

1. 创建或确认 `monitoring-system` 命名空间
2. 部署 `k8s/monitoring/prometheus-grafana-portable.yaml`
3. 部署 `k8s/monitoring/node-exporter.yaml`
4. 等待核心组件就绪
5. 在控制台提示如何用 `port-forward` 访问 Prometheus 和 Grafana

### 任务 3：发布 Halo 主题

用途：

- 将仓库中的 `theme/halo-k8s-theme` 发布到 Halo
- 用于后续前台页面样式和模板更新

前提：

- 已先成功执行 `halo-bootstrap-portable`
- Halo 已经启动
- 第一次需要在 Halo 后台手动启用 `halo-k8s-theme`

Jenkins 新建任务时建议：

- 任务类型：`Pipeline`
- 任务名称：`halo-theme-portable`

Pipeline：

- Definition：`Pipeline script from SCM`
- SCM：`Git`
- Repository URL：
  - `https://github.com/goo825/halo-k8s-blog.git`
- Branches to build：
  - `*/codex/monitoring-cicd-module`
- Script Path：
  - `Jenkinsfile`

保存后点击：

- `Build Now`

构建成功后，Jenkins 会：

1. 查找 `blog-system` 命名空间中的 Halo Pod
2. 将 `theme/halo-k8s-theme` 同步到 `/root/.halo2/themes/halo-k8s-theme`
3. 执行 Halo Deployment 滚动重启

### 是否需要配置自动触发

如果只是做项目复现，建议先手动点击 `Build Now`，这样最清晰。

如果后续要做持续交付，可以再给主题发布任务增加：

- `Poll SCM`

例如：

```text
H/2 * * * *
```

表示每 2 分钟轮询一次仓库变更。

### Jenkins 侧前置条件

在开始前，对方需要确认 Jenkins 具备：

- 可以执行 `kubectl`
- `kubectl` 已连接到目标集群
- Jenkins 所在身份有权限创建 namespace、deployment、service、pvc、daemonset 等资源

如果 Jenkins 没有这些权限，即使任务配置正确，也会在执行 `kubectl apply` 时失败。

## Halo 外部地址

portable 版把 Halo 外部地址改为：

```text
http://localhost:8090
```

如需修改，可编辑：

- `k8s/halo/halo-portable.yaml`

中的 `ConfigMap/halo-config`。

## SMTP 邮件告警

默认不启用邮件告警，不影响 Grafana 启动。

只有在需要邮件通知时，才额外执行：

```bash
kubectl apply -f k8s/monitoring/grafana-smtp-secret.qq.example.yaml
kubectl rollout restart deployment/grafana -n monitoring-system
```

部署前请将模板中的邮箱和 SMTP 授权码替换为对方自己的值。
