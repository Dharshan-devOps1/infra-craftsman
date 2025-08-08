// Terraform templates for all supported modules across AWS, Azure, and GCP

export const awsTemplates = {
  // Existing modules
  vpc: (params: Record<string, string>) => `# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "${params.vpc_cidr || '10.0.0.0/16'}"
  enable_dns_hostnames = ${params.enable_dns_hostnames || 'true'}
  enable_dns_support   = true

  tags = {
    Name = "\${var.project_name}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "\${var.project_name}-igw"
  }
}`,

  subnet: (params: Record<string, string>) => {
    const publicCidrs = params.public_subnet_cidrs?.split(',') || ['10.0.1.0/24', '10.0.2.0/24'];
    const privateCidrs = params.private_subnet_cidrs?.split(',') || ['10.0.10.0/24', '10.0.20.0/24'];
    
    return `# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Public Subnets
${publicCidrs.map((cidr, index) => `
resource "aws_subnet" "public_${index + 1}" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "${cidr.trim()}"
  availability_zone       = data.aws_availability_zones.available.names[${index}]
  map_public_ip_on_launch = true

  tags = {
    Name = "\${var.project_name}-public-subnet-${index + 1}"
    Type = "Public"
  }
}`).join('')}

# Private Subnets
${privateCidrs.map((cidr, index) => `
resource "aws_subnet" "private_${index + 1}" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "${cidr.trim()}"
  availability_zone = data.aws_availability_zones.available.names[${index}]

  tags = {
    Name = "\${var.project_name}-private-subnet-${index + 1}"
    Type = "Private"
  }
}`).join('')}

# Route table for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "\${var.project_name}-public-rt"
  }
}

# Associate public subnets with route table
${publicCidrs.map((_, index) => `
resource "aws_route_table_association" "public_${index + 1}" {
  subnet_id      = aws_subnet.public_${index + 1}.id
  route_table_id = aws_route_table.public.id
}`).join('')}`;
  },

  ec2: (params: Record<string, string>) => `# Security Group for EC2 instances
resource "aws_security_group" "ec2" {
  name_prefix = "\${var.project_name}-ec2"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-ec2-sg"
  }
}

# EC2 Instances
resource "aws_instance" "main" {
  count           = ${params.instance_count || '1'}
  ami             = data.aws_ami.amazon_linux.id
  instance_type   = "${params.instance_type || 't3.micro'}"
  subnet_id       = aws_subnet.public_1.id
  security_groups = [aws_security_group.ec2.id]

  tags = {
    Name = "\${var.project_name}-instance-\${count.index + 1}"
  }
}

# Data source for Amazon Linux AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}`,

  s3: (params: Record<string, string>) => `# S3 Bucket
resource "aws_s3_bucket" "main" {
  bucket = "${params.bucket_name || '\${var.project_name}-bucket-\${random_id.bucket_suffix.hex}'}"

  tags = {
    Name = "\${var.project_name}-bucket"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "${params.versioning === 'true' ? 'Enabled' : 'Suspended'}"
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Random ID for bucket naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}`,

  // New compute modules
  batch_job_queue: (params: Record<string, string>) => `# Batch Job Queue
resource "aws_batch_job_queue" "main" {
  name     = "${params.job_queue_name || 'my-job-queue'}"
  state    = "${params.state || 'ENABLED'}"
  priority = ${params.priority || '1'}

  compute_environment_order {
    order               = 1
    compute_environment = aws_batch_compute_environment.main.arn
  }

  tags = {
    Name = "\${var.project_name}-job-queue"
  }
}`,

  batch_compute_environment: (params: Record<string, string>) => `# Batch Compute Environment
resource "aws_batch_compute_environment" "main" {
  compute_environment_name = "${params.compute_environment_name || 'my-compute-env'}"
  type                     = "MANAGED"
  state                    = "ENABLED"

  compute_resources {
    type                = "EC2"
    min_vcpus           = ${params.min_vcpus || '0'}
    max_vcpus           = ${params.max_vcpus || '100'}
    desired_vcpus       = ${params.min_vcpus || '0'}
    instance_types      = [${params.instance_types?.split(',').map(t => `"${t.trim()}"`).join(', ') || '"m5.large"'} ]
    instance_role       = aws_iam_instance_profile.ecs_instance_role.arn
    
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]
    
    security_group_ids = [
      aws_security_group.batch.id
    ]
  }

  service_role = aws_iam_role.batch_service_role.arn

  tags = {
    Name = "\${var.project_name}-batch-compute-env"
  }
}

# Security Group for Batch
resource "aws_security_group" "batch" {
  name_prefix = "\${var.project_name}-batch"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-batch-sg"
  }
}`,

  fargate_task_definition: (params: Record<string, string>) => `# Fargate Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = "${params.task_family || 'my-fargate-task'}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${params.cpu || '256'}"
  memory                   = "${params.memory || '512'}"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "main"
      image = "${params.container_image || 'nginx:latest'}"
      
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.main.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "\${var.project_name}-task-definition"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "main" {
  name              = "/ecs/\${var.project_name}"
  retention_in_days = 7

  tags = {
    Name = "\${var.project_name}-log-group"
  }
}`,

  ecs_cluster: (params: Record<string, string>) => `# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${params.cluster_name || 'my-ecs-cluster'}"

  capacity_providers = [${params.capacity_providers?.split(',').map(cp => `"${cp.trim()}"`).join(', ') || '"FARGATE", "EC2"'}]

  tags = {
    Name = "\${var.project_name}-ecs-cluster"
  }
}`,

  ecs_service: (params: Record<string, string>) => `# ECS Service
resource "aws_ecs_service" "main" {
  name            = "${params.service_name || 'my-ecs-service'}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = ${params.desired_count || '2'}
  launch_type     = "${params.launch_type || 'FARGATE'}"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = false
  }

  tags = {
    Name = "\${var.project_name}-ecs-service"
  }
}

# Security Group for ECS Service
resource "aws_security_group" "ecs_service" {
  name_prefix = "\${var.project_name}-ecs-service"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-ecs-service-sg"
  }
}`,

  // Additional AWS templates would continue here...
  // For brevity, showing pattern for networking modules

  vpn_connection: (params: Record<string, string>) => `# VPN Connection
resource "aws_vpn_connection" "main" {
  customer_gateway_id = "${params.customer_gateway_id}"
  vpn_gateway_id     = "${params.vpn_gateway_id}"
  type               = "ipsec.1"
  static_routes_only = ${params.static_routes_only || 'false'}

  tags = {
    Name = "\${var.project_name}-vpn-connection"
  }
}`,

  vpn_gateway: (params: Record<string, string>) => `# VPN Gateway
resource "aws_vpn_gateway" "main" {
  vpc_id         = aws_vpc.main.id
  amazon_side_asn = ${params.amazon_side_asn || '64512'}

  tags = {
    Name = "${params.vpn_gateway_name || 'main-vpn-gw'}"
  }
}`,

  customer_gateway: (params: Record<string, string>) => `# Customer Gateway
resource "aws_customer_gateway" "main" {
  bgp_asn    = ${params.bgp_asn || '65000'}
  ip_address = "${params.ip_address}"
  type       = "${params.type || 'ipsec.1'}"

  tags = {
    Name = "\${var.project_name}-customer-gateway"
  }
}`
};

export const azureTemplates = {
  container_group: (params: Record<string, string>) => `# Container Group
resource "azurerm_container_group" "main" {
  name                = "${params.container_group_name || 'my-container-group'}"
  location            = var.location
  resource_group_name = var.resource_group_name
  ip_address_type     = "Public"
  os_type             = "${params.os_type || 'Linux'}"

  container {
    name   = "main"
    image  = "${params.container_image || 'nginx:latest'}"
    cpu    = "${params.cpu || '0.5'}"
    memory = "${params.memory || '1.5'}"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }

  tags = {
    Environment = var.environment
  }
}`,

  container_registry: (params: Record<string, string>) => `# Container Registry
resource "azurerm_container_registry" "main" {
  name                = "${params.registry_name || 'mycontainerregistry'}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "${params.sku || 'Standard'}"
  admin_enabled       = ${params.admin_enabled || 'false'}

  tags = {
    Environment = var.environment
  }
}`,

  key_vault: (params: Record<string, string>) => `# Key Vault
resource "azurerm_key_vault" "main" {
  name                = "${params.key_vault_name || 'my-key-vault'}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "${params.sku_name || 'standard'}"

  enabled_for_disk_encryption = ${params.enabled_for_disk_encryption || 'false'}

  tags = {
    Environment = var.environment
  }
}

data "azurerm_client_config" "current" {}`
};

export const gcpTemplates = {
  compute_instance_template: (params: Record<string, string>) => `# Compute Instance Template
resource "google_compute_instance_template" "main" {
  name         = "${params.template_name || 'my-instance-template'}"
  machine_type = "${params.machine_type || 'e2-medium'}"

  disk {
    source_image = "${params.source_image || 'debian-cloud/debian-11'}"
    auto_delete  = true
    boot         = true
    disk_size_gb = ${params.disk_size_gb || '20'}
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }

  metadata = {
    startup-script = "echo 'Hello World' > /tmp/hello.txt"
  }

  tags = ["web", "dev"]

  labels = {
    environment = var.environment
  }
}`,

  app_engine_application: (params: Record<string, string>) => `# App Engine Application
resource "google_app_engine_application" "main" {
  project     = "${params.project_id}"
  location_id = "${params.location_id || 'us-central'}"
}`,

  cloud_run_service: (params: Record<string, string>) => `# Cloud Run Service
resource "google_cloud_run_service" "main" {
  name     = "${params.service_name || 'my-cloud-run-service'}"
  location = "${params.location || 'us-central1'}"

  template {
    spec {
      containers {
        image = "${params.image || 'gcr.io/cloudrun/hello'}"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow unauthenticated access
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.main.name
  location = google_cloud_run_service.main.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}`,

  storage_bucket_acl: (params: Record<string, string>) => `# Storage Bucket ACL
resource "google_storage_bucket_acl" "main" {
  bucket      = "${params.bucket_name}"
  role_entity = [${params.role_entity?.split(',').map(re => `"${re.trim()}"`).join(', ') || '"READER:allUsers"'}]
}`,

  kms_key_ring: (params: Record<string, string>) => `# KMS Key Ring
resource "google_kms_key_ring" "main" {
  name     = "${params.key_ring_name || 'my-key-ring'}"
  location = "${params.location || 'global'}"
}`,

  kms_crypto_key: (params: Record<string, string>) => `# KMS Crypto Key
resource "google_kms_crypto_key" "main" {
  name     = "${params.crypto_key_name || 'my-crypto-key'}"
  key_ring = google_kms_key_ring.${params.key_ring || 'main'}.id
  purpose  = "${params.purpose || 'ENCRYPT_DECRYPT'}"
}`
};
