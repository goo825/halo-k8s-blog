# Monitoring Stack

本目录用于管理 Halo 三节点 Kubernetes 集群的基础监控模块。

当前已纳入：

- Prometheus
- Grafana
- kube-state-metrics
- node-exporter
- Grafana SMTP 邮件告警相关配置

## 部署规划

组件部署位置如下：

- `Prometheus`：`k8s-master-03`
- `Grafana`：`k8s-master-03`
- `kube-state-metrics`：`k8s-master-03`
- `node-exporter`：三节点 `DaemonSet`

命名空间：

- `monitoring-system`

宿主机持久化目录：

- Prometheus：`/data/prometheus`
- Grafana：`/data/grafana`

## 文件说明

- `prometheus-grafana-node03.yaml`：命名空间、RBAC、PV/PVC、Prometheus、Grafana、kube-state-metrics 主清单
- `prometheus-grafana-portable.yaml`：portable 版主清单，适合默认 `StorageClass` 环境
- `node-exporter.yaml`：节点监控 `DaemonSet` 与 Service
- `node03-prepare.yaml`：用于初始化 `k8s-master-03` 宿主机目录的一次性 Job
- `prepare-node03.sh`：手工准备节点目录时的兜底脚本
- `grafana-smtp-secret.qq.example.yaml`：Grafana QQ 邮箱 SMTP Secret 示例，可按需单独启用

## 访问地址

- Prometheus：`http://10.0.0.103:30900`
- Grafana：`http://10.0.0.103:30901`

Grafana 默认账号：

- 用户名：`admin`
- 密码：`admin`

## 手动部署顺序

如需手动部署，建议按以下顺序执行：

```bash
kubectl create namespace monitoring-system --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/monitoring/node03-prepare.yaml
kubectl wait --for=condition=complete job/monitoring-node03-prepare -n monitoring-system --timeout=120s
kubectl apply -f k8s/monitoring/prometheus-grafana-node03.yaml
kubectl apply -f k8s/monitoring/node-exporter.yaml
kubectl rollout status deployment/prometheus -n monitoring-system --timeout=180s
kubectl rollout status deployment/grafana -n monitoring-system --timeout=180s
kubectl rollout status deployment/kube-state-metrics -n monitoring-system --timeout=180s
```

## Jenkins 自动化部署

监控模块已拆分为独立 Jenkins 流水线，推荐使用：

- 分支：`codex/monitoring-cicd-module`
- Script Path：`Jenkinsfile.monitoring`

流水线执行内容：

1. 自动创建或确认 `monitoring-system` 命名空间
2. 自动执行 `node03-prepare.yaml` 准备 `k8s-master-03` 宿主机目录
3. 自动部署 Prometheus、Grafana、kube-state-metrics
4. 自动部署 node-exporter
5. 自动输出访问地址

这样可以让监控部署与博客主题发布互不影响，便于后续单独维护和迁移。

如果是在“别人直接复现”的场景，推荐使用：

- Script Path：`Jenkinsfile.monitoring.portable`

portable 版特点：

- 不依赖 `k8s-master-03`
- 不依赖 `/data/prometheus` 和 `/data/grafana`
- 不需要执行 `node03-prepare.yaml`
- 默认通过 `port-forward` 访问 Prometheus 和 Grafana

## Grafana 邮件告警

Grafana SMTP 采用 Kubernetes Secret 注入，并且现在是可选能力。

默认情况下：

- 直接部署 `prometheus-grafana-node03.yaml` 即可完成监控主体部署
- 即使没有 SMTP Secret，Grafana 也可以正常启动
- 只有邮件通知功能不可用

如果需要启用邮件告警，再额外创建 SMTP Secret。

应用方式：

```bash
kubectl apply -f k8s/monitoring/grafana-smtp-secret.qq.example.yaml
kubectl rollout restart deployment/grafana -n monitoring-system
```

Grafana 重启后，可以在后台配置：

- Contact point：`Email`
- Receiver：目标邮箱
- Alert rules：例如 CPU、内存、磁盘、实例掉线等阈值告警

当前项目中已验证：

- QQ 邮箱 SMTP 可用
- Grafana 测试通知可成功发送
- 节点 CPU 过高规则可实际触发并成功发送 QQ 邮件

已完成的一条示例规则：

- 规则名称：`节点CPU使用率过高`
- PromQL：
  - `100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- 阈值：`> 80`
- 待定期：`5m`
- 联系点：`qq-mail-alert`
- 收件邮箱：`554405551@qq.com`

## 已验证结果

当前监控模块已确认具备以下能力：

- Grafana 可以正常连接 Prometheus
- `up` 查询可返回正常结果
- 三节点 `node-exporter` 在线
- `kube-state-metrics` 在线
- 节点 CPU、内存、磁盘指标可正常展示
- 邮件通知能力可用
- CPU 过高场景的真实告警链路已完成验证
