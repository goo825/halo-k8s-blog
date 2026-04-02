# halo-k8s-blog

基于 Kubernetes 的 Halo 博客自动化部署与运维实践项目。

项目覆盖以下能力：

- Halo 博客系统部署
- MySQL 数据持久化
- Jenkins + GitHub CI/CD
- Halo 主题资源自动发布
- Prometheus + Grafana 监控与邮件告警

## 项目架构

```text
GitHub -> Jenkins -> Kubernetes -> Halo -> MySQL
                           |
                           -> Prometheus -> Grafana
```

## 集群规划

集群为三节点 Kubernetes 环境：

- `10.0.0.101` -> `k8s-master-01`
- `10.0.0.102` -> `k8s-master-02`
- `10.0.0.103` -> `k8s-master-03`

节点角色：

- `k8s-master-01`
  - Halo
  - node-exporter
- `k8s-master-02`
  - MySQL
  - node-exporter
- `k8s-master-03`
  - Jenkins
  - Prometheus
  - Grafana
  - kube-state-metrics
  - node-exporter

环境约束：

- Kubernetes 版本：`v1.18.0`
- 三台节点均带有 master 角色
- 部署到指定 master 节点时需要 `tolerations`
- 集群无默认 `StorageClass`
- 持久化依赖手动创建 `PV/PVC`

## 仓库结构

- `Jenkinsfile`：博客主题发布流水线
- `Jenkinsfile.bootstrap.portable`：portable 版博客基础栈部署流水线
- `Jenkinsfile.monitoring`：监控模块发布流水线
- `Jenkinsfile.monitoring.portable`：portable 版监控部署流水线
- `Jenkinsfile.stack.portable`：统一的 stack 部署流水线
- `theme/halo-k8s-theme`：仓库管理的 Halo 自定义主题
- `k8s/mysql`：MySQL 部署与存储清单
- `k8s/halo`：Halo 部署清单
- `k8s/cicd/jenkins`：Jenkins 部署清单
- `k8s/monitoring`：Prometheus、Grafana、node-exporter 等监控清单
- `k8s/portable`：可复现部署说明
- `k8s/stacks`：按部署块聚合后的单文件清单

## 当前已完成成果

### 博客系统

- Halo 已固定部署到 `k8s-master-01`
- MySQL 已固定部署到 `k8s-master-02`
- Halo 可正常连接 MySQL
- 文章发布、Pod 重建、自愈与数据持久化均已验证

### CI/CD

- Jenkins 已固定部署到 `k8s-master-03`
- GitHub 仓库变更可触发 Jenkins 拉取仓库
- `Jenkinsfile` 会发布主题目录 `theme/halo-k8s-theme`
- 主题会被同步到 Halo 容器目录 `/root/.halo2/themes/halo-k8s-theme`
- 发布完成后自动执行 Halo Deployment 滚动更新

### 监控与告警

- Prometheus、Grafana、kube-state-metrics 已部署到 `k8s-master-03`
- `node-exporter` 以 `DaemonSet` 形式运行在三节点
- Grafana 已验证可连接 Prometheus
- 节点 CPU、内存、磁盘指标可正常展示
- 监控主体部署与 SMTP 邮件配置已解耦，邮件告警可按需启用
- Grafana SMTP 邮件通知已验证可用
- 节点 CPU 过高规则已成功触发并发送 QQ 邮件

## 访问地址

- Halo：`http://10.0.0.101:31029`
- Jenkins：`http://10.0.0.103:30081`
- Prometheus：`http://10.0.0.103:30900`
- Grafana：`http://10.0.0.103:30901`

默认账号：

- Jenkins：`admin / admin`
- Grafana：`admin / admin`

## 主题发布说明

本仓库已经从“同步零散静态资源”切换为“发布完整 Halo 主题包”。

主题发布流程如下：

1. Jenkins 拉取 GitHub 仓库
2. 查找当前 Halo Pod
3. 将 `theme/halo-k8s-theme` 同步到 `/root/.halo2/themes/halo-k8s-theme`
4. 执行 `kubectl rollout restart deployment/halo`
5. 等待滚动更新完成

首次发布后，还需要在 Halo 后台手动启用 `halo-k8s-theme`。完成一次启用后，后续主题模板、CSS、JS 的 Git 提交即可通过 Jenkins 自动交付到前台页面。

## 监控模块说明

监控模块已拆分为独立流水线：

- 分支：`codex/monitoring-cicd-module`
- 流水线脚本：`Jenkinsfile.monitoring`

这样做的目的：

- 与博客主题发布流水线隔离
- 降低模块间相互影响
- 便于后续在新环境复用

更详细的监控部署说明见 `k8s/monitoring/README.md`。

## 分支说明

- `codex/theme-package-polish`：Halo 主题开发与前台优化
- `codex/monitoring-cicd-module`：监控部署、Grafana SMTP、监控流水线相关改动

## 当前项目结论

本项目已经完成从博客部署、主题发布、监控部署到邮件告警的基本自动化闭环，具备论文展示、课程答辩和工程实践复盘所需的核心成果。

## 可复现部署

为了让别人更容易复现，本仓库现在保留了两套思路：

### 环境专用版

适用于当前论文环境，特点是：

- 固定节点名
- 固定本地目录
- 固定 NodePort
- 适合与你现有三节点集群保持一致

### Portable 版

适用于“别人直接拿去部署”，特点是：

- 不再绑定 `k8s-master-01/02/03`
- 不再依赖 `/data/...` 本地目录和手工 `PV`
- 默认使用集群已有 `StorageClass`
- 默认通过 `kubectl port-forward` 访问服务
- SMTP 邮件告警保持可选

portable 版入口：

- [k8s/portable/README.md](C:/Users/Administrator/Desktop/halo-k8s-blog-repo/k8s/portable/README.md)
- [Jenkinsfile.bootstrap.portable](C:/Users/Administrator/Desktop/halo-k8s-blog-repo/Jenkinsfile.bootstrap.portable)
- [Jenkinsfile.monitoring.portable](C:/Users/Administrator/Desktop/halo-k8s-blog-repo/Jenkinsfile.monitoring.portable)
- [Jenkinsfile.stack.portable](C:/Users/Administrator/Desktop/halo-k8s-blog-repo/Jenkinsfile.stack.portable)
- [k8s/stacks/README.md](C:/Users/Administrator/Desktop/halo-k8s-blog-repo/k8s/stacks/README.md)

portable 版核心清单：

- `k8s/mysql/mysql-portable.yaml`
- `k8s/halo/halo-portable.yaml`
- `k8s/monitoring/prometheus-grafana-portable.yaml`
- `k8s/monitoring/node-exporter.yaml`

如果想把仓库按“三大块部署”来使用，推荐直接用 stack 文件：

- `k8s/stacks/blog-stack-portable.yaml`
- `k8s/stacks/jenkins-stack-portable.yaml`
- `k8s/stacks/monitoring-stack-portable.yaml`

配合 `Jenkinsfile.stack.portable`，Jenkins 只需要改：

- 构建分支
- 参数 `STACK_FILE`

就可以复用同一套流水线去部署三大块。
