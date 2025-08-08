import { TerraformModule } from "@/components/ModuleSelector";

export const awsModules: TerraformModule[] = [
  // Existing modules
  {
    id: "vpc",
    name: "VPC", 
    description: "Virtual Private Cloud with customizable CIDR blocks",
    category: "networking",
    parameters: [
      { name: "vpc_cidr", type: "string", description: "CIDR block for VPC", required: true, defaultValue: "10.0.0.0/16" },
      { name: "enable_dns_hostnames", type: "boolean", description: "Enable DNS hostnames", required: false, defaultValue: "true" }
    ]
  },
  {
    id: "subnet",
    name: "Subnets",
    description: "Public and private subnets across availability zones", 
    category: "networking",
    parameters: [
      { name: "public_subnet_cidrs", type: "list", description: "CIDR blocks for public subnets", required: true, defaultValue: "10.0.1.0/24,10.0.2.0/24" },
      { name: "private_subnet_cidrs", type: "list", description: "CIDR blocks for private subnets", required: true, defaultValue: "10.0.10.0/24,10.0.20.0/24" }
    ]
  },
  {
    id: "ec2",
    name: "EC2 Instances",
    description: "Elastic Compute Cloud instances",
    category: "compute",
    parameters: [
      { name: "instance_type", type: "string", description: "EC2 instance type", required: true, defaultValue: "t3.micro", options: ["t3.micro", "t3.small", "t3.medium", "t3.large"] },
      { name: "instance_count", type: "number", description: "Number of instances", required: true, defaultValue: "1" }
    ]
  },
  {
    id: "s3",
    name: "S3 Bucket",
    description: "Simple Storage Service bucket",
    category: "storage", 
    parameters: [
      { name: "bucket_name", type: "string", description: "S3 bucket name", required: true },
      { name: "versioning", type: "boolean", description: "Enable versioning", required: false, defaultValue: "false" }
    ]
  },

  // New Compute modules
  {
    id: "batch_job_queue",
    name: "Batch Job Queue",
    description: "AWS Batch job queue for processing batch workloads",
    category: "compute",
    parameters: [
      { name: "job_queue_name", type: "string", description: "Name of the batch job queue", required: true, defaultValue: "my-job-queue" },
      { name: "priority", type: "number", description: "Priority of the job queue", required: true, defaultValue: "1" },
      { name: "state", type: "string", description: "State of the job queue", required: false, defaultValue: "ENABLED", options: ["ENABLED", "DISABLED"] }
    ]
  },
  {
    id: "batch_compute_environment", 
    name: "Batch Compute Environment",
    description: "Managed compute environment for AWS Batch",
    category: "compute",
    parameters: [
      { name: "compute_environment_name", type: "string", description: "Name of compute environment", required: true, defaultValue: "my-compute-env" },
      { name: "instance_types", type: "list", description: "Instance types for compute environment", required: true, defaultValue: "m5.large,m5.xlarge" },
      { name: "min_vcpus", type: "number", description: "Minimum vCPUs", required: true, defaultValue: "0" },
      { name: "max_vcpus", type: "number", description: "Maximum vCPUs", required: true, defaultValue: "100" }
    ]
  },
  {
    id: "fargate_task_definition",
    name: "Fargate Task Definition", 
    description: "Task definition for AWS Fargate serverless containers",
    category: "compute",
    parameters: [
      { name: "task_family", type: "string", description: "Task definition family name", required: true, defaultValue: "my-fargate-task" },
      { name: "cpu", type: "string", description: "CPU units (256, 512, 1024, etc.)", required: true, defaultValue: "256", options: ["256", "512", "1024", "2048", "4096"] },
      { name: "memory", type: "string", description: "Memory in MB", required: true, defaultValue: "512", options: ["512", "1024", "2048", "4096", "8192"] },
      { name: "container_image", type: "string", description: "Docker container image", required: true, defaultValue: "nginx:latest" }
    ]
  },
  {
    id: "ecs_cluster",
    name: "ECS Cluster",
    description: "Elastic Container Service cluster for container orchestration",
    category: "compute", 
    parameters: [
      { name: "cluster_name", type: "string", description: "Name of the ECS cluster", required: true, defaultValue: "my-ecs-cluster" },
      { name: "capacity_providers", type: "list", description: "Capacity providers for the cluster", required: false, defaultValue: "FARGATE,EC2" }
    ]
  },
  {
    id: "ecs_service",
    name: "ECS Service",
    description: "Service to run and maintain containers in ECS cluster",
    category: "compute",
    parameters: [
      { name: "service_name", type: "string", description: "Name of the ECS service", required: true, defaultValue: "my-ecs-service" },
      { name: "desired_count", type: "number", description: "Desired number of tasks", required: true, defaultValue: "2" },
      { name: "launch_type", type: "string", description: "Launch type for service", required: true, defaultValue: "FARGATE", options: ["FARGATE", "EC2"] }
    ]
  },

  // New Networking modules
  {
    id: "vpn_connection",
    name: "VPN Connection",
    description: "Site-to-site VPN connection to AWS VPC",
    category: "networking",
    parameters: [
      { name: "customer_gateway_id", type: "string", description: "Customer gateway ID", required: true },
      { name: "vpn_gateway_id", type: "string", description: "VPN gateway ID", required: true },
      { name: "static_routes_only", type: "boolean", description: "Use static routes only", required: false, defaultValue: "false" }
    ]
  },
  {
    id: "vpn_gateway",
    name: "VPN Gateway", 
    description: "Virtual private gateway for VPN connections",
    category: "networking",
    parameters: [
      { name: "vpn_gateway_name", type: "string", description: "Name tag for VPN gateway", required: true, defaultValue: "main-vpn-gw" },
      { name: "amazon_side_asn", type: "number", description: "ASN for Amazon side of BGP session", required: false, defaultValue: "64512" }
    ]
  },
  {
    id: "customer_gateway",
    name: "Customer Gateway",
    description: "Customer side of VPN connection",
    category: "networking", 
    parameters: [
      { name: "bgp_asn", type: "number", description: "BGP ASN of customer gateway", required: true, defaultValue: "65000" },
      { name: "ip_address", type: "string", description: "Public IP address of customer gateway", required: true },
      { name: "type", type: "string", description: "Type of VPN connection", required: true, defaultValue: "ipsec.1", options: ["ipsec.1"] }
    ]
  },
  {
    id: "elb",
    name: "Classic Load Balancer",
    description: "Classic Elastic Load Balancer (ELB)",
    category: "networking",
    parameters: [
      { name: "load_balancer_name", type: "string", description: "Name of the load balancer", required: true, defaultValue: "my-classic-lb" },
      { name: "listener_port", type: "number", description: "Port for load balancer listener", required: true, defaultValue: "80" },
      { name: "health_check_target", type: "string", description: "Health check target", required: true, defaultValue: "HTTP:80/" }
    ]
  },
  {
    id: "alb", 
    name: "Application Load Balancer",
    description: "Application Load Balancer for HTTP/HTTPS traffic",
    category: "networking",
    parameters: [
      { name: "load_balancer_name", type: "string", description: "Name of the application load balancer", required: true, defaultValue: "my-app-lb" },
      { name: "load_balancer_type", type: "string", description: "Type of load balancer", required: true, defaultValue: "application", options: ["application"] },
      { name: "scheme", type: "string", description: "Load balancer scheme", required: true, defaultValue: "internet-facing", options: ["internet-facing", "internal"] }
    ]
  },
  {
    id: "nlb",
    name: "Network Load Balancer", 
    description: "Network Load Balancer for TCP/UDP traffic",
    category: "networking",
    parameters: [
      { name: "load_balancer_name", type: "string", description: "Name of the network load balancer", required: true, defaultValue: "my-net-lb" },
      { name: "load_balancer_type", type: "string", description: "Type of load balancer", required: true, defaultValue: "network", options: ["network"] },
      { name: "scheme", type: "string", description: "Load balancer scheme", required: true, defaultValue: "internet-facing", options: ["internet-facing", "internal"] }
    ]
  },
  {
    id: "network_acl",
    name: "Network ACL",
    description: "Network Access Control List for subnet-level security",
    category: "networking",
    parameters: [
      { name: "network_acl_name", type: "string", description: "Name tag for network ACL", required: true, defaultValue: "main-nacl" }
    ]
  },

  // New Storage modules  
  {
    id: "glacier_vault",
    name: "Glacier Vault",
    description: "Amazon Glacier vault for long-term archival storage",
    category: "storage",
    parameters: [
      { name: "vault_name", type: "string", description: "Name of the Glacier vault", required: true, defaultValue: "my-glacier-vault" },
      { name: "notification_topic", type: "string", description: "SNS topic for notifications", required: false }
    ]
  },
  {
    id: "s3_access_point",
    name: "S3 Access Point",
    description: "S3 access point for simplified bucket access management",
    category: "storage",
    parameters: [
      { name: "access_point_name", type: "string", description: "Name of the S3 access point", required: true, defaultValue: "my-access-point" },
      { name: "bucket_name", type: "string", description: "Name of the S3 bucket", required: true }
    ]
  },

  // Database modules
  {
    id: "rds_cluster",
    name: "RDS Aurora Cluster",
    description: "Amazon RDS Aurora database cluster",
    category: "database",
    parameters: [
      { name: "cluster_identifier", type: "string", description: "Cluster identifier", required: true, defaultValue: "my-aurora-cluster" },
      { name: "engine", type: "string", description: "Database engine", required: true, defaultValue: "aurora-mysql", options: ["aurora-mysql", "aurora-postgresql"] },
      { name: "master_username", type: "string", description: "Master username", required: true, defaultValue: "admin" },
      { name: "database_name", type: "string", description: "Initial database name", required: false, defaultValue: "mydb" }
    ]
  },
  {
    id: "redshift_cluster", 
    name: "Redshift Cluster",
    description: "Amazon Redshift data warehouse cluster",
    category: "database",
    parameters: [
      { name: "cluster_identifier", type: "string", description: "Cluster identifier", required: true, defaultValue: "my-redshift-cluster" },
      { name: "node_type", type: "string", description: "Node type", required: true, defaultValue: "dc2.large", options: ["dc2.large", "dc2.8xlarge", "ra3.xlplus", "ra3.4xlarge"] },
      { name: "number_of_nodes", type: "number", description: "Number of nodes", required: true, defaultValue: "1" },
      { name: "master_username", type: "string", description: "Master username", required: true, defaultValue: "admin" }
    ]
  },

  // Identity & Access modules
  {
    id: "iam_instance_profile",
    name: "IAM Instance Profile",
    description: "IAM instance profile for EC2 instances",
    category: "identity",
    parameters: [
      { name: "instance_profile_name", type: "string", description: "Name of instance profile", required: true, defaultValue: "my-instance-profile" },
      { name: "role_name", type: "string", description: "IAM role name to attach", required: true }
    ]
  },
  {
    id: "iam_policy_attachment",
    name: "IAM Policy Attachment",
    description: "Attach IAM policy to user, group, or role",
    category: "identity",
    parameters: [
      { name: "attachment_name", type: "string", description: "Name of policy attachment", required: true, defaultValue: "my-policy-attachment" },
      { name: "policy_arn", type: "string", description: "ARN of the policy to attach", required: true },
      { name: "users", type: "list", description: "List of user names", required: false },
      { name: "roles", type: "list", description: "List of role names", required: false },
      { name: "groups", type: "list", description: "List of group names", required: false }
    ]
  },
  {
    id: "organizations_account",
    name: "Organizations Account",
    description: "AWS Organizations member account",
    category: "identity", 
    parameters: [
      { name: "account_name", type: "string", description: "Name of the account", required: true, defaultValue: "member-account" },
      { name: "email", type: "string", description: "Email address for the account", required: true }
    ]
  },
  {
    id: "organizations_organizational_unit",
    name: "Organizational Unit",
    description: "AWS Organizations organizational unit",
    category: "identity",
    parameters: [
      { name: "ou_name", type: "string", description: "Name of organizational unit", required: true, defaultValue: "production-ou" },
      { name: "parent_id", type: "string", description: "Parent organizational unit ID", required: true }
    ]
  },

  // Monitoring & Logging modules
  {
    id: "cloudtrail",
    name: "CloudTrail",
    description: "AWS CloudTrail for API logging and monitoring",
    category: "monitoring",
    parameters: [
      { name: "trail_name", type: "string", description: "Name of CloudTrail", required: true, defaultValue: "my-cloudtrail" },
      { name: "s3_bucket_name", type: "string", description: "S3 bucket for CloudTrail logs", required: true },
      { name: "include_global_service_events", type: "boolean", description: "Include global service events", required: false, defaultValue: "true" }
    ]
  },
  {
    id: "config_rule",
    name: "Config Rule",
    description: "AWS Config rule for compliance monitoring", 
    category: "monitoring",
    parameters: [
      { name: "rule_name", type: "string", description: "Name of Config rule", required: true, defaultValue: "my-config-rule" },
      { name: "source_identifier", type: "string", description: "Source identifier for rule", required: true, defaultValue: "S3_BUCKET_PUBLIC_ACCESS_PROHIBITED" }
    ]
  },
  {
    id: "sns_topic",
    name: "SNS Topic",
    description: "Simple Notification Service topic for messaging",
    category: "monitoring",
    parameters: [
      { name: "topic_name", type: "string", description: "Name of SNS topic", required: true, defaultValue: "my-sns-topic" },
      { name: "display_name", type: "string", description: "Display name for topic", required: false }
    ]
  },
  {
    id: "sqs_queue",
    name: "SQS Queue", 
    description: "Simple Queue Service for message queuing",
    category: "monitoring",
    parameters: [
      { name: "queue_name", type: "string", description: "Name of SQS queue", required: true, defaultValue: "my-sqs-queue" },
      { name: "visibility_timeout_seconds", type: "number", description: "Visibility timeout in seconds", required: false, defaultValue: "30" },
      { name: "message_retention_seconds", type: "number", description: "Message retention in seconds", required: false, defaultValue: "345600" }
    ]
  },

  // Security modules
  {
    id: "waf_web_acl",
    name: "WAF Web ACL",
    description: "Web Application Firewall access control list",
    category: "security",
    parameters: [
      { name: "web_acl_name", type: "string", description: "Name of WAF Web ACL", required: true, defaultValue: "my-web-acl" },
      { name: "default_action", type: "string", description: "Default action for requests", required: true, defaultValue: "ALLOW", options: ["ALLOW", "BLOCK"] }
    ]
  },
  {
    id: "shield_protection",
    name: "Shield Protection",
    description: "AWS Shield Advanced protection for resources",
    category: "security",
    parameters: [
      { name: "protection_name", type: "string", description: "Name of Shield protection", required: true, defaultValue: "my-shield-protection" },
      { name: "resource_arn", type: "string", description: "ARN of resource to protect", required: true }
    ]
  }
];

export const azureModules: TerraformModule[] = [
  // Compute modules
  {
    id: "container_group",
    name: "Container Group",
    description: "Azure Container Instances group for serverless containers",
    category: "compute",
    parameters: [
      { name: "container_group_name", type: "string", description: "Name of container group", required: true, defaultValue: "my-container-group" },
      { name: "os_type", type: "string", description: "Operating system type", required: true, defaultValue: "Linux", options: ["Linux", "Windows"] },
      { name: "container_image", type: "string", description: "Docker container image", required: true, defaultValue: "nginx:latest" },
      { name: "cpu", type: "string", description: "CPU cores", required: true, defaultValue: "0.5" },
      { name: "memory", type: "string", description: "Memory in GB", required: true, defaultValue: "1.5" }
    ]
  },
  {
    id: "container_registry",
    name: "Container Registry",
    description: "Azure Container Registry for storing container images",
    category: "compute",
    parameters: [
      { name: "registry_name", type: "string", description: "Name of container registry", required: true, defaultValue: "mycontainerregistry" },
      { name: "sku", type: "string", description: "SKU tier", required: true, defaultValue: "Standard", options: ["Basic", "Standard", "Premium"] },
      { name: "admin_enabled", type: "boolean", description: "Enable admin user", required: false, defaultValue: "false" }
    ]
  },
  {
    id: "batch_account",
    name: "Batch Account",
    description: "Azure Batch account for large-scale parallel workloads",
    category: "compute",
    parameters: [
      { name: "batch_account_name", type: "string", description: "Name of batch account", required: true, defaultValue: "mybatchaccount" },
      { name: "pool_allocation_mode", type: "string", description: "Pool allocation mode", required: true, defaultValue: "BatchService", options: ["BatchService", "UserSubscription"] }
    ]
  },

  // Networking modules
  {
    id: "application_gateway",
    name: "Application Gateway",
    description: "Azure Application Gateway for web traffic load balancing",
    category: "networking",
    parameters: [
      { name: "gateway_name", type: "string", description: "Name of application gateway", required: true, defaultValue: "my-app-gateway" },
      { name: "sku_name", type: "string", description: "SKU name", required: true, defaultValue: "Standard_Small", options: ["Standard_Small", "Standard_Medium", "Standard_Large", "WAF_Medium", "WAF_Large"] },
      { name: "sku_tier", type: "string", description: "SKU tier", required: true, defaultValue: "Standard", options: ["Standard", "WAF"] },
      { name: "sku_capacity", type: "number", description: "SKU capacity", required: true, defaultValue: "2" }
    ]
  },
  {
    id: "firewall",
    name: "Azure Firewall",
    description: "Azure Firewall for network security",
    category: "networking",
    parameters: [
      { name: "firewall_name", type: "string", description: "Name of Azure Firewall", required: true, defaultValue: "my-firewall" },
      { name: "sku_name", type: "string", description: "SKU name", required: true, defaultValue: "AZFW_VNet", options: ["AZFW_VNet", "AZFW_Hub"] },
      { name: "sku_tier", type: "string", description: "SKU tier", required: true, defaultValue: "Standard", options: ["Standard", "Premium"] }
    ]
  },
  {
    id: "vpn_gateway",
    name: "VPN Gateway",
    description: "Azure VPN Gateway for site-to-site connectivity",
    category: "networking",
    parameters: [
      { name: "vpn_gateway_name", type: "string", description: "Name of VPN gateway", required: true, defaultValue: "my-vpn-gateway" },
      { name: "type", type: "string", description: "VPN gateway type", required: true, defaultValue: "Vpn", options: ["Vpn", "ExpressRoute"] },
      { name: "sku", type: "string", description: "Gateway SKU", required: true, defaultValue: "VpnGw1", options: ["Basic", "VpnGw1", "VpnGw2", "VpnGw3"] }
    ]
  },
  {
    id: "express_route_circuit",
    name: "ExpressRoute Circuit",
    description: "Azure ExpressRoute circuit for private connectivity",
    category: "networking",
    parameters: [
      { name: "circuit_name", type: "string", description: "Name of ExpressRoute circuit", required: true, defaultValue: "my-er-circuit" },
      { name: "service_provider_name", type: "string", description: "Service provider name", required: true },
      { name: "peering_location", type: "string", description: "Peering location", required: true },
      { name: "bandwidth_in_mbps", type: "number", description: "Bandwidth in Mbps", required: true, defaultValue: "50" }
    ]
  },

  // Storage modules
  {
    id: "storage_share",
    name: "Storage File Share",
    description: "Azure Storage file share for shared file access",
    category: "storage",
    parameters: [
      { name: "share_name", type: "string", description: "Name of file share", required: true, defaultValue: "my-file-share" },
      { name: "quota", type: "number", description: "Storage quota in GB", required: true, defaultValue: "100" }
    ]
  },
  {
    id: "blob_container",
    name: "Blob Container",
    description: "Azure Storage blob container for object storage",
    category: "storage",
    parameters: [
      { name: "container_name", type: "string", description: "Name of blob container", required: true, defaultValue: "my-blob-container" },
      { name: "container_access_type", type: "string", description: "Container access type", required: true, defaultValue: "private", options: ["private", "blob", "container"] }
    ]
  },

  // Database modules
  {
    id: "postgresql_server",
    name: "PostgreSQL Server",
    description: "Azure Database for PostgreSQL server",
    category: "database",
    parameters: [
      { name: "server_name", type: "string", description: "Name of PostgreSQL server", required: true, defaultValue: "my-postgresql-server" },
      { name: "administrator_login", type: "string", description: "Administrator login username", required: true, defaultValue: "psqladmin" },
      { name: "sku_name", type: "string", description: "SKU name", required: true, defaultValue: "B_Gen5_2", options: ["B_Gen5_1", "B_Gen5_2", "GP_Gen5_2", "GP_Gen5_4", "MO_Gen5_2"] },
      { name: "version", type: "string", description: "PostgreSQL version", required: true, defaultValue: "11", options: ["9.5", "9.6", "10", "11"] }
    ]
  },
  {
    id: "mariadb_server",
    name: "MariaDB Server",
    description: "Azure Database for MariaDB server",
    category: "database",
    parameters: [
      { name: "server_name", type: "string", description: "Name of MariaDB server", required: true, defaultValue: "my-mariadb-server" },
      { name: "administrator_login", type: "string", description: "Administrator login username", required: true, defaultValue: "mariadbadmin" },
      { name: "sku_name", type: "string", description: "SKU name", required: true, defaultValue: "B_Gen5_2", options: ["B_Gen5_1", "B_Gen5_2", "GP_Gen5_2", "GP_Gen5_4", "MO_Gen5_2"] },
      { name: "version", type: "string", description: "MariaDB version", required: true, defaultValue: "10.2", options: ["10.2", "10.3"] }
    ]
  },
  {
    id: "cosmosdb_sql_container",
    name: "Cosmos DB SQL Container",
    description: "Azure Cosmos DB SQL API container",
    category: "database",
    parameters: [
      { name: "container_name", type: "string", description: "Name of Cosmos DB container", required: true, defaultValue: "my-container" },
      { name: "partition_key_path", type: "string", description: "Partition key path", required: true, defaultValue: "/partitionKey" },
      { name: "throughput", type: "number", description: "Throughput (RU/s)", required: false, defaultValue: "400" }
    ]
  },

  // Identity & Access modules
  {
    id: "managed_service_identity",
    name: "Managed Service Identity",
    description: "Azure Managed Service Identity for Azure resources",
    category: "identity",
    parameters: [
      { name: "identity_name", type: "string", description: "Name of managed identity", required: true, defaultValue: "my-managed-identity" },
      { name: "type", type: "string", description: "Identity type", required: true, defaultValue: "UserAssigned", options: ["SystemAssigned", "UserAssigned"] }
    ]
  },
  {
    id: "role_assignment",
    name: "Role Assignment",
    description: "Azure RBAC role assignment",
    category: "identity",
    parameters: [
      { name: "role_definition_name", type: "string", description: "Role definition name", required: true, defaultValue: "Reader", options: ["Reader", "Contributor", "Owner", "User Access Administrator"] },
      { name: "principal_id", type: "string", description: "Principal ID (user, group, or service principal)", required: true },
      { name: "scope", type: "string", description: "Scope for role assignment", required: true }
    ]
  },

  // Monitoring & Logging modules
  {
    id: "log_analytics_solution",
    name: "Log Analytics Solution",
    description: "Azure Log Analytics solution for monitoring",
    category: "monitoring",
    parameters: [
      { name: "solution_name", type: "string", description: "Name of Log Analytics solution", required: true, defaultValue: "ContainerInsights" },
      { name: "plan_name", type: "string", description: "Solution plan name", required: true, defaultValue: "ContainerInsights" },
      { name: "plan_product", type: "string", description: "Solution plan product", required: true, defaultValue: "OMSGallery/ContainerInsights" }
    ]
  },
  {
    id: "alert_rule_metric",
    name: "Metric Alert Rule",
    description: "Azure Monitor metric alert rule",
    category: "monitoring",
    parameters: [
      { name: "alert_rule_name", type: "string", description: "Name of alert rule", required: true, defaultValue: "my-alert-rule" },
      { name: "metric_name", type: "string", description: "Metric name to monitor", required: true, defaultValue: "Percentage CPU" },
      { name: "operator", type: "string", description: "Comparison operator", required: true, defaultValue: "GreaterThan", options: ["Equals", "NotEquals", "GreaterThan", "GreaterThanOrEqual", "LessThan", "LessThanOrEqual"] },
      { name: "threshold", type: "number", description: "Alert threshold", required: true, defaultValue: "80" }
    ]
  },

  // Security modules
  {
    id: "security_center_subscription_pricing",
    name: "Security Center Pricing",
    description: "Azure Security Center subscription pricing tier",
    category: "security",
    parameters: [
      { name: "tier", type: "string", description: "Pricing tier", required: true, defaultValue: "Standard", options: ["Free", "Standard"] },
      { name: "resource_type", type: "string", description: "Resource type", required: true, defaultValue: "VirtualMachines", options: ["VirtualMachines", "StorageAccounts", "SqlServers", "KeyVaults", "AppServices"] }
    ]
  },
  {
    id: "key_vault",
    name: "Key Vault",
    description: "Azure Key Vault for secrets management",
    category: "security",
    parameters: [
      { name: "key_vault_name", type: "string", description: "Name of Key Vault", required: true, defaultValue: "my-key-vault" },
      { name: "sku_name", type: "string", description: "SKU name", required: true, defaultValue: "standard", options: ["standard", "premium"] },
      { name: "enabled_for_disk_encryption", type: "boolean", description: "Enable for disk encryption", required: false, defaultValue: "false" }
    ]
  }
];

export const gcpModules: TerraformModule[] = [
  // Compute modules
  {
    id: "compute_instance_template",
    name: "Compute Instance Template",
    description: "Google Cloud instance template for managed instance groups",
    category: "compute",
    parameters: [
      { name: "template_name", type: "string", description: "Name of instance template", required: true, defaultValue: "my-instance-template" },
      { name: "machine_type", type: "string", description: "Machine type", required: true, defaultValue: "e2-medium", options: ["e2-micro", "e2-small", "e2-medium", "e2-standard-2", "e2-standard-4"] },
      { name: "source_image", type: "string", description: "Source image", required: true, defaultValue: "debian-cloud/debian-11" },
      { name: "disk_size_gb", type: "number", description: "Boot disk size in GB", required: true, defaultValue: "20" }
    ]
  },
  {
    id: "app_engine_application",
    name: "App Engine Application",
    description: "Google App Engine application for serverless web apps",
    category: "compute",
    parameters: [
      { name: "project_id", type: "string", description: "GCP project ID", required: true },
      { name: "location_id", type: "string", description: "Location for App Engine app", required: true, defaultValue: "us-central", options: ["us-central", "us-west2", "us-east1", "europe-west", "asia-northeast1"] }
    ]
  },
  {
    id: "cloud_run_service",
    name: "Cloud Run Service",
    description: "Google Cloud Run service for containerized applications",
    category: "compute",
    parameters: [
      { name: "service_name", type: "string", description: "Name of Cloud Run service", required: true, defaultValue: "my-cloud-run-service" },
      { name: "location", type: "string", description: "Location for service", required: true, defaultValue: "us-central1", options: ["us-central1", "us-east1", "us-west1", "europe-west1", "asia-east1"] },
      { name: "image", type: "string", description: "Container image URL", required: true, defaultValue: "gcr.io/cloudrun/hello" }
    ]
  },

  // Networking modules
  {
    id: "compute_forwarding_rule",
    name: "Compute Forwarding Rule",
    description: "Google Cloud forwarding rule for load balancing",
    category: "networking",
    parameters: [
      { name: "forwarding_rule_name", type: "string", description: "Name of forwarding rule", required: true, defaultValue: "my-forwarding-rule" },
      { name: "ip_protocol", type: "string", description: "IP protocol", required: true, defaultValue: "TCP", options: ["TCP", "UDP", "ESP", "AH", "SCTP", "ICMP"] },
      { name: "port_range", type: "string", description: "Port range", required: true, defaultValue: "80" }
    ]
  },
  {
    id: "compute_target_https_proxy",
    name: "Target HTTPS Proxy",
    description: "Google Cloud target HTTPS proxy for load balancing",
    category: "networking",
    parameters: [
      { name: "proxy_name", type: "string", description: "Name of HTTPS proxy", required: true, defaultValue: "my-https-proxy" },
      { name: "url_map", type: "string", description: "URL map for the proxy", required: true }
    ]
  },
  {
    id: "compute_managed_ssl_certificate",
    name: "Managed SSL Certificate",
    description: "Google Cloud managed SSL certificate",
    category: "networking",
    parameters: [
      { name: "certificate_name", type: "string", description: "Name of SSL certificate", required: true, defaultValue: "my-ssl-cert" },
      { name: "domains", type: "list", description: "List of domains for certificate", required: true, defaultValue: "example.com,www.example.com" }
    ]
  },

  // Storage modules
  {
    id: "storage_bucket_acl",
    name: "Storage Bucket ACL",
    description: "Google Cloud Storage bucket access control list",
    category: "storage",
    parameters: [
      { name: "bucket_name", type: "string", description: "Name of storage bucket", required: true },
      { name: "role_entity", type: "list", description: "Role entity pairs", required: true, defaultValue: "READER:allUsers" }
    ]
  },
  {
    id: "storage_bucket_object",
    name: "Storage Bucket Object",
    description: "Google Cloud Storage bucket object",
    category: "storage",
    parameters: [
      { name: "object_name", type: "string", description: "Name of storage object", required: true, defaultValue: "my-object" },
      { name: "bucket_name", type: "string", description: "Name of storage bucket", required: true },
      { name: "source", type: "string", description: "Path to source file", required: true }
    ]
  },

  // Database modules
  {
    id: "bigquery_dataset",
    name: "BigQuery Dataset",
    description: "Google BigQuery dataset for analytics",
    category: "database",
    parameters: [
      { name: "dataset_id", type: "string", description: "Dataset ID", required: true, defaultValue: "my_dataset" },
      { name: "friendly_name", type: "string", description: "Friendly name for dataset", required: false, defaultValue: "My Dataset" },
      { name: "description", type: "string", description: "Dataset description", required: false, defaultValue: "My BigQuery dataset" },
      { name: "location", type: "string", description: "Dataset location", required: true, defaultValue: "US", options: ["US", "EU", "asia-southeast1", "us-central1", "us-east1"] }
    ]
  },
  {
    id: "bigtable_instance",
    name: "Bigtable Instance",
    description: "Google Cloud Bigtable instance for NoSQL database",
    category: "database",
    parameters: [
      { name: "instance_name", type: "string", description: "Name of Bigtable instance", required: true, defaultValue: "my-bigtable-instance" },
      { name: "cluster_id", type: "string", description: "Cluster ID", required: true, defaultValue: "my-bigtable-cluster" },
      { name: "zone", type: "string", description: "Zone for cluster", required: true, defaultValue: "us-central1-b", options: ["us-central1-a", "us-central1-b", "us-central1-c", "us-east1-a", "us-west1-a"] },
      { name: "num_nodes", type: "number", description: "Number of nodes", required: true, defaultValue: "1" }
    ]
  },

  // Identity & Access modules
  {
    id: "iam_policy",
    name: "IAM Policy",
    description: "Google Cloud IAM policy for access control",
    category: "identity",
    parameters: [
      { name: "policy_data", type: "string", description: "JSON policy data", required: true }
    ]
  },
  {
    id: "iam_role",
    name: "IAM Custom Role",
    description: "Google Cloud custom IAM role",
    category: "identity",
    parameters: [
      { name: "role_id", type: "string", description: "Role ID", required: true, defaultValue: "my_custom_role" },
      { name: "title", type: "string", description: "Role title", required: true, defaultValue: "My Custom Role" },
      { name: "description", type: "string", description: "Role description", required: false, defaultValue: "Custom role for my project" },
      { name: "permissions", type: "list", description: "List of permissions", required: true, defaultValue: "compute.instances.get,compute.instances.list" }
    ]
  },

  // Monitoring & Logging modules
  {
    id: "monitoring_dashboard",
    name: "Monitoring Dashboard",
    description: "Google Cloud Monitoring dashboard",
    category: "monitoring",
    parameters: [
      { name: "dashboard_name", type: "string", description: "Name of monitoring dashboard", required: true, defaultValue: "my-dashboard" },
      { name: "display_name", type: "string", description: "Display name for dashboard", required: true, defaultValue: "My Monitoring Dashboard" }
    ]
  },
  {
    id: "logging_project_sink",
    name: "Logging Project Sink",
    description: "Google Cloud Logging sink for exporting logs",
    category: "monitoring",
    parameters: [
      { name: "sink_name", type: "string", description: "Name of logging sink", required: true, defaultValue: "my-log-sink" },
      { name: "destination", type: "string", description: "Sink destination", required: true },
      { name: "filter", type: "string", description: "Log filter", required: false, defaultValue: "severity >= ERROR" }
    ]
  },

  // Security modules
  {
    id: "kms_key_ring",
    name: "KMS Key Ring",
    description: "Google Cloud KMS key ring for encryption keys",
    category: "security",
    parameters: [
      { name: "key_ring_name", type: "string", description: "Name of key ring", required: true, defaultValue: "my-key-ring" },
      { name: "location", type: "string", description: "Location for key ring", required: true, defaultValue: "global", options: ["global", "us-central1", "us-east1", "us-west1", "europe-west1", "asia-east1"] }
    ]
  },
  {
    id: "kms_crypto_key",
    name: "KMS Crypto Key",
    description: "Google Cloud KMS cryptographic key",
    category: "security",
    parameters: [
      { name: "crypto_key_name", type: "string", description: "Name of crypto key", required: true, defaultValue: "my-crypto-key" },
      { name: "key_ring", type: "string", description: "Key ring name", required: true },
      { name: "purpose", type: "string", description: "Key purpose", required: true, defaultValue: "ENCRYPT_DECRYPT", options: ["ENCRYPT_DECRYPT", "ASYMMETRIC_SIGN", "ASYMMETRIC_DECRYPT"] }
    ]
  }
];
