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
      { 
        name: "instance_type", 
        type: "string", 
        description: "EC2 instance type", 
        required: true, 
        defaultValue: "t3.micro", 
        options: [
          // General Purpose
          "t3.nano", "t3.micro", "t3.small", "t3.medium", "t3.large", "t3.xlarge", "t3.2xlarge",
          "t3a.nano", "t3a.micro", "t3a.small", "t3a.medium", "t3a.large", "t3a.xlarge", "t3a.2xlarge",
          "t4g.nano", "t4g.micro", "t4g.small", "t4g.medium", "t4g.large", "t4g.xlarge", "t4g.2xlarge",
          "m5.large", "m5.xlarge", "m5.2xlarge", "m5.4xlarge", "m5.8xlarge", "m5.12xlarge", "m5.16xlarge", "m5.24xlarge",
          "m5a.large", "m5a.xlarge", "m5a.2xlarge", "m5a.4xlarge", "m5a.8xlarge", "m5a.12xlarge", "m5a.16xlarge", "m5a.24xlarge",
          "m6i.large", "m6i.xlarge", "m6i.2xlarge", "m6i.4xlarge", "m6i.8xlarge", "m6i.12xlarge", "m6i.16xlarge", "m6i.24xlarge", "m6i.32xlarge",
          // Compute Optimized
          "c5.large", "c5.xlarge", "c5.2xlarge", "c5.4xlarge", "c5.9xlarge", "c5.12xlarge", "c5.18xlarge", "c5.24xlarge",
          "c5a.large", "c5a.xlarge", "c5a.2xlarge", "c5a.4xlarge", "c5a.8xlarge", "c5a.12xlarge", "c5a.16xlarge", "c5a.24xlarge",
          "c6i.large", "c6i.xlarge", "c6i.2xlarge", "c6i.4xlarge", "c6i.8xlarge", "c6i.12xlarge", "c6i.16xlarge", "c6i.24xlarge", "c6i.32xlarge",
          // Memory Optimized
          "r5.large", "r5.xlarge", "r5.2xlarge", "r5.4xlarge", "r5.8xlarge", "r5.12xlarge", "r5.16xlarge", "r5.24xlarge",
          "r5a.large", "r5a.xlarge", "r5a.2xlarge", "r5a.4xlarge", "r5a.8xlarge", "r5a.12xlarge", "r5a.16xlarge", "r5a.24xlarge",
          "r6i.large", "r6i.xlarge", "r6i.2xlarge", "r6i.4xlarge", "r6i.8xlarge", "r6i.12xlarge", "r6i.16xlarge", "r6i.24xlarge", "r6i.32xlarge",
          // Storage Optimized
          "i3.large", "i3.xlarge", "i3.2xlarge", "i3.4xlarge", "i3.8xlarge", "i3.16xlarge",
          "d3.xlarge", "d3.2xlarge", "d3.4xlarge", "d3.8xlarge",
          // Accelerated Computing
          "p3.2xlarge", "p3.8xlarge", "p3.16xlarge", "p3dn.24xlarge",
          "p4d.24xlarge", "g4dn.xlarge", "g4dn.2xlarge", "g4dn.4xlarge", "g4dn.8xlarge", "g4dn.12xlarge", "g4dn.16xlarge"
        ]
      },
      { name: "instance_count", type: "number", description: "Number of instances", required: true, defaultValue: "1" },
      { name: "ami_id", type: "string", description: "AMI ID for instances", required: false, defaultValue: "ami-0c02fb55956c7d316" },
      { name: "key_name", type: "string", description: "EC2 Key Pair name", required: false }
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

  // Networking modules (missing from current set)
  {
    id: "route_table",
    name: "Route Table",
    description: "Route table for VPC routing configuration",
    category: "networking",
    parameters: [
      { name: "vpc_id", type: "string", description: "VPC ID for route table", required: true },
      { name: "public_route_table", type: "boolean", description: "Create public route table", required: false, defaultValue: "true" },
      { name: "private_route_table", type: "boolean", description: "Create private route table", required: false, defaultValue: "true" }
    ]
  },
  {
    id: "internet_gateway",
    name: "Internet Gateway",
    description: "Internet gateway for VPC internet access",
    category: "networking",
    parameters: [
      { name: "vpc_id", type: "string", description: "VPC ID to attach gateway", required: true }
    ]
  },
  {
    id: "nat_gateway",
    name: "NAT Gateway",
    description: "NAT gateway for private subnet internet access",
    category: "networking",
    parameters: [
      { name: "subnet_id", type: "string", description: "Public subnet ID for NAT gateway", required: true },
      { name: "allocation_id", type: "string", description: "Elastic IP allocation ID", required: false }
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
  // Core Networking modules first
  {
    id: "virtual_network",
    name: "Virtual Network",
    description: "Azure Virtual Network for network isolation",
    category: "networking",
    parameters: [
      { name: "vnet_name", type: "string", description: "Virtual network name", required: true, defaultValue: "my-vnet" },
      { name: "address_space", type: "list", description: "Address space for VNet", required: true, defaultValue: "10.0.0.0/16" },
      { name: "dns_servers", type: "list", description: "Custom DNS servers", required: false }
    ]
  },
  {
    id: "subnet",
    name: "Subnet",
    description: "Azure subnet within virtual network",
    category: "networking",
    parameters: [
      { name: "subnet_name", type: "string", description: "Subnet name", required: true, defaultValue: "my-subnet" },
      { name: "address_prefixes", type: "list", description: "Address prefixes for subnet", required: true, defaultValue: "10.0.1.0/24" },
      { name: "virtual_network_name", type: "string", description: "Virtual network name", required: true }
    ]
  },
  {
    id: "route_table",
    name: "Route Table",
    description: "Azure route table for custom routing",
    category: "networking",
    parameters: [
      { name: "route_table_name", type: "string", description: "Route table name", required: true, defaultValue: "my-route-table" },
      { name: "disable_bgp_route_propagation", type: "boolean", description: "Disable BGP route propagation", required: false, defaultValue: "false" }
    ]
  },
  {
    id: "nat_gateway",
    name: "NAT Gateway",
    description: "Azure NAT Gateway for outbound internet connectivity",
    category: "networking",
    parameters: [
      { name: "nat_gateway_name", type: "string", description: "NAT Gateway name", required: true, defaultValue: "my-nat-gateway" },
      { name: "sku_name", type: "string", description: "SKU name", required: true, defaultValue: "Standard", options: ["Standard"] },
      { name: "idle_timeout_in_minutes", type: "number", description: "Idle timeout in minutes", required: false, defaultValue: "4" }
    ]
  },

  // Compute modules
  {
    id: "virtual_machine",
    name: "Virtual Machine",
    description: "Azure Virtual Machine with comprehensive size options",
    category: "compute",
    parameters: [
      { name: "vm_name", type: "string", description: "Virtual machine name", required: true, defaultValue: "my-vm" },
      { 
        name: "vm_size", 
        type: "string", 
        description: "Virtual machine size", 
        required: true, 
        defaultValue: "Standard_B2s", 
        options: [
          // Basic (B-series)
          "Standard_B1ls", "Standard_B1s", "Standard_B1ms", "Standard_B2s", "Standard_B2ms", "Standard_B4ms", "Standard_B8ms", "Standard_B12ms", "Standard_B16ms", "Standard_B20ms",
          // General Purpose (D-series)
          "Standard_D2s_v3", "Standard_D4s_v3", "Standard_D8s_v3", "Standard_D16s_v3", "Standard_D32s_v3", "Standard_D48s_v3", "Standard_D64s_v3",
          "Standard_D2s_v4", "Standard_D4s_v4", "Standard_D8s_v4", "Standard_D16s_v4", "Standard_D32s_v4", "Standard_D48s_v4", "Standard_D64s_v4",
          "Standard_D2s_v5", "Standard_D4s_v5", "Standard_D8s_v5", "Standard_D16s_v5", "Standard_D32s_v5", "Standard_D48s_v5", "Standard_D64s_v5", "Standard_D96s_v5",
          // Compute Optimized (F-series)
          "Standard_F2s_v2", "Standard_F4s_v2", "Standard_F8s_v2", "Standard_F16s_v2", "Standard_F32s_v2", "Standard_F48s_v2", "Standard_F64s_v2", "Standard_F72s_v2",
          // Memory Optimized (E-series)
          "Standard_E2s_v3", "Standard_E4s_v3", "Standard_E8s_v3", "Standard_E16s_v3", "Standard_E20s_v3", "Standard_E32s_v3", "Standard_E48s_v3", "Standard_E64s_v3",
          "Standard_E2s_v4", "Standard_E4s_v4", "Standard_E8s_v4", "Standard_E16s_v4", "Standard_E20s_v4", "Standard_E32s_v4", "Standard_E48s_v4", "Standard_E64s_v4",
          "Standard_E2s_v5", "Standard_E4s_v5", "Standard_E8s_v5", "Standard_E16s_v5", "Standard_E20s_v5", "Standard_E32s_v5", "Standard_E48s_v5", "Standard_E64s_v5", "Standard_E96s_v5",
          // High Performance Compute (H-series)
          "Standard_H8", "Standard_H16", "Standard_H8m", "Standard_H16m", "Standard_H16r", "Standard_H16mr",
          // GPU (N-series)
          "Standard_NC6", "Standard_NC12", "Standard_NC24", "Standard_NC6s_v3", "Standard_NC12s_v3", "Standard_NC24s_v3",
          "Standard_ND6s", "Standard_ND12s", "Standard_ND24s", "Standard_ND40rs_v2",
          "Standard_NV6", "Standard_NV12", "Standard_NV24", "Standard_NV12s_v3", "Standard_NV24s_v3", "Standard_NV48s_v3"
        ]
      },
      { name: "admin_username", type: "string", description: "Administrator username", required: true, defaultValue: "azureuser" },
      { name: "disable_password_authentication", type: "boolean", description: "Disable password authentication", required: false, defaultValue: "true" },
      { name: "source_image_reference", type: "string", description: "OS image reference", required: true, defaultValue: "Ubuntu", options: ["Ubuntu", "CentOS", "RHEL", "Windows", "Debian"] }
    ]
  },
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
  // Core Networking modules first
  {
    id: "compute_network",
    name: "VPC Network",
    description: "Google Cloud VPC network for network isolation",
    category: "networking",
    parameters: [
      { name: "network_name", type: "string", description: "VPC network name", required: true, defaultValue: "my-vpc-network" },
      { name: "auto_create_subnetworks", type: "boolean", description: "Auto create subnetworks", required: false, defaultValue: "false" },
      { name: "routing_mode", type: "string", description: "Routing mode", required: true, defaultValue: "REGIONAL", options: ["REGIONAL", "GLOBAL"] }
    ]
  },
  {
    id: "compute_subnetwork",
    name: "Subnetwork",
    description: "Google Cloud subnetwork within VPC",
    category: "networking",
    parameters: [
      { name: "subnetwork_name", type: "string", description: "Subnetwork name", required: true, defaultValue: "my-subnetwork" },
      { name: "ip_cidr_range", type: "string", description: "IP CIDR range for subnetwork", required: true, defaultValue: "10.0.1.0/24" },
      { name: "region", type: "string", description: "Region for subnetwork", required: true, defaultValue: "us-central1" },
      { name: "network", type: "string", description: "VPC network name", required: true }
    ]
  },
  {
    id: "compute_route",
    name: "Route",
    description: "Google Cloud custom route for traffic routing",
    category: "networking",
    parameters: [
      { name: "route_name", type: "string", description: "Route name", required: true, defaultValue: "my-route" },
      { name: "dest_range", type: "string", description: "Destination IP range", required: true, defaultValue: "0.0.0.0/0" },
      { name: "network", type: "string", description: "VPC network name", required: true },
      { name: "next_hop_gateway", type: "string", description: "Next hop gateway", required: false, defaultValue: "default-internet-gateway" }
    ]
  },

  {
    id: "compute_instance",
    name: "Compute Instance",
    description: "Google Cloud Compute Engine virtual machine",
    category: "compute",
    parameters: [
      { name: "instance_name", type: "string", description: "Instance name", required: true, defaultValue: "my-instance" },
      { 
        name: "machine_type", 
        type: "string", 
        description: "Machine type", 
        required: true, 
        defaultValue: "e2-medium", 
        options: [
          // E2 Series (General-purpose)
          "e2-micro", "e2-small", "e2-medium", "e2-standard-2", "e2-standard-4", "e2-standard-8", "e2-standard-16", "e2-standard-32",
          "e2-highmem-2", "e2-highmem-4", "e2-highmem-8", "e2-highmem-16",
          "e2-highcpu-2", "e2-highcpu-4", "e2-highcpu-8", "e2-highcpu-16", "e2-highcpu-32",
          // N1 Series (General-purpose)
          "n1-standard-1", "n1-standard-2", "n1-standard-4", "n1-standard-8", "n1-standard-16", "n1-standard-32", "n1-standard-64", "n1-standard-96",
          "n1-highmem-2", "n1-highmem-4", "n1-highmem-8", "n1-highmem-16", "n1-highmem-32", "n1-highmem-64", "n1-highmem-96",
          "n1-highcpu-2", "n1-highcpu-4", "n1-highcpu-8", "n1-highcpu-16", "n1-highcpu-32", "n1-highcpu-64", "n1-highcpu-96",
          // N2 Series (General-purpose)
          "n2-standard-2", "n2-standard-4", "n2-standard-8", "n2-standard-16", "n2-standard-32", "n2-standard-48", "n2-standard-64", "n2-standard-80", "n2-standard-128",
          "n2-highmem-2", "n2-highmem-4", "n2-highmem-8", "n2-highmem-16", "n2-highmem-32", "n2-highmem-48", "n2-highmem-64", "n2-highmem-80", "n2-highmem-96", "n2-highmem-128",
          "n2-highcpu-2", "n2-highcpu-4", "n2-highcpu-8", "n2-highcpu-16", "n2-highcpu-32", "n2-highcpu-48", "n2-highcpu-64", "n2-highcpu-80", "n2-highcpu-96",
          // C2 Series (Compute-optimized)
          "c2-standard-4", "c2-standard-8", "c2-standard-16", "c2-standard-30", "c2-standard-60",
          // M1 Series (Memory-optimized)
          "m1-ultramem-40", "m1-ultramem-80", "m1-ultramem-160",
          "m1-megamem-96",
          // A2 Series (Accelerator-optimized)
          "a2-highgpu-1g", "a2-highgpu-2g", "a2-highgpu-4g", "a2-highgpu-8g", "a2-megagpu-16g",
          // T2D Series (General-purpose AMD)
          "t2d-standard-1", "t2d-standard-2", "t2d-standard-4", "t2d-standard-8", "t2d-standard-16", "t2d-standard-32", "t2d-standard-48", "t2d-standard-60"
        ]
      },
      { name: "zone", type: "string", description: "Zone for instance", required: true, defaultValue: "us-central1-a" },
      { name: "source_image", type: "string", description: "Source image", required: true, defaultValue: "debian-cloud/debian-11" },
      { name: "disk_size_gb", type: "number", description: "Boot disk size in GB", required: true, defaultValue: "20" }
    ]
  },
  {
    id: "compute_instance_template",
    name: "Compute Instance Template",
    description: "Google Cloud instance template for managed instance groups",
    category: "compute",
    parameters: [
      { name: "template_name", type: "string", description: "Name of instance template", required: true, defaultValue: "my-instance-template" },
      { 
        name: "machine_type", 
        type: "string", 
        description: "Machine type", 
        required: true, 
        defaultValue: "e2-medium", 
        options: [
          // E2 Series (General-purpose)
          "e2-micro", "e2-small", "e2-medium", "e2-standard-2", "e2-standard-4", "e2-standard-8", "e2-standard-16", "e2-standard-32",
          "e2-highmem-2", "e2-highmem-4", "e2-highmem-8", "e2-highmem-16",
          "e2-highcpu-2", "e2-highcpu-4", "e2-highcpu-8", "e2-highcpu-16", "e2-highcpu-32",
          // N1 Series
          "n1-standard-1", "n1-standard-2", "n1-standard-4", "n1-standard-8", "n1-standard-16", "n1-standard-32",
          "n1-highmem-2", "n1-highmem-4", "n1-highmem-8", "n1-highmem-16", "n1-highmem-32",
          "n1-highcpu-2", "n1-highcpu-4", "n1-highcpu-8", "n1-highcpu-16", "n1-highcpu-32",
          // N2 Series
          "n2-standard-2", "n2-standard-4", "n2-standard-8", "n2-standard-16", "n2-standard-32",
          "n2-highmem-2", "n2-highmem-4", "n2-highmem-8", "n2-highmem-16", "n2-highmem-32",
          // C2 Series
          "c2-standard-4", "c2-standard-8", "c2-standard-16", "c2-standard-30"
        ]
      },
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
