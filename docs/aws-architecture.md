# AWS構成

EC2からRDS PostgreSQLへ接続し、外部からNestJS APIのヘルスチェックを実行できる最小構成とする。

```mermaid
flowchart LR
    User["iPhone / 開発PC"]
    GitHub["GitHub"]

    subgraph AWS["AWS"]
        IGW["Internet Gateway"]

        subgraph VPC["VPC"]
            subgraph Public["パブリックサブネット"]
                EC2["EC2<br/>Amazon Linux<br/>Nginx + NestJS + systemd"]
            end

            subgraph PrivateA["プライベートサブネット A"]
                RDS["RDS PostgreSQL<br/>Single-AZ"]
            end

            subgraph PrivateB["プライベートサブネット B"]
                Standby["RDS用サブネット<br/>初期はDB配置なし"]
            end
        end

        Secrets["Secrets Manager"]
        Logs["CloudWatch Logs"]
    end

    User -->|"HTTP：初期疎通<br/>HTTPS：後で追加"| IGW
    IGW --> EC2
    EC2 -->|"5432<br/>Security Group限定"| RDS
    Secrets -->|"DB接続情報"| EC2
    EC2 --> Logs
    GitHub -.->|"初回は手動<br/>後でCI/CD"| EC2
```

## 初期構成に含めないもの

- ECS / Fargate
- Application Load Balancer
- NAT Gateway
- Route 53
- CI/CD
- Multi-AZ RDS

初回はEC2上でDockerを使用せず、Node.js、systemd、Nginxを利用してNestJSを実行する。
