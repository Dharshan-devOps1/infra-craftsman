// Terraform templates for generating HCL code for various cloud resources

export const awsTemplates = {
  vpc: (params: Record<string, string>) => `# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "\${params.vpc_cidr || '10.0.0.0/16'}"
  enable_dns_hostnames = \${params.enable_dns_hostnames || 'true'}
  enable_dns_support   = true

  tags = {
    Name        = "\${var.project_name}-vpc"
    Environment = var.environment
  }
}`,

  subnet: (params: Record<string, string>) => `# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = element(split(",", "\${params.public_subnet_cidrs || '10.0.1.0/24,10.0.2.0/24'}"), count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name        = "\${var.project_name}-public-\${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = element(split(",", "\${params.private_subnet_cidrs || '10.0.10.0/24,10.0.20.0/24'}"), count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "\${var.project_name}-private-\${count.index + 1}"
    Environment = var.environment
    Type        = "Private"
  }
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}`,

  // Enhanced EC2 with comprehensive instance type support
  ec2: (params: Record<string, string>) => `# EC2 Instances
resource "aws_instance" "main" {
  count         = \${params.instance_count || '1'}
  ami           = "\${params.ami_id || 'ami-0c02fb55956c7d316'}" # Amazon Linux 2
  instance_type = "\${params.instance_type || 't3.micro'}"

  subnet_id              = aws_subnet.public[count.index % length(aws_subnet.public)].id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name              = "\${params.key_name || ''}"

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl start httpd
    systemctl enable httpd
    echo "<h1>Hello from \${var.project_name} - Instance \${count.index + 1}</h1>" > /var/www/html/index.html
  EOF

  tags = {
    Name        = "\${var.project_name}-instance-\${count.index + 1}"
    Environment = var.environment
    InstanceType = "\${params.instance_type || 't3.micro'}"
  }
}

# Security Group for EC2 instances
resource "aws_security_group" "web" {
  name_prefix = "\${var.project_name}-web-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
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
    Name        = "\${var.project_name}-web-sg"
    Environment = var.environment
  }
}`,

  s3: (params: Record<string, string>) => `# S3 Bucket
resource "aws_s3_bucket" "main" {
  bucket = "\${params.bucket_name}"

  tags = {
    Name        = "\${params.bucket_name}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "\${params.versioning === 'true' ? 'Enabled' : 'Suspended'}"
  }
}`,

  // New networking components
  route_table: (params: Record<string, string>) => `# Route Tables
\${params.public_route_table === 'true' ? \`resource "aws_route_table" "public" {
  vpc_id = \${params.vpc_id || 'aws_vpc.main.id'}

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "\${var.project_name}-public-rt"
    Environment = var.environment
    Type        = "Public"
  }
}\` : ''}

\${params.private_route_table === 'true' ? \`resource "aws_route_table" "private" {
  vpc_id = \${params.vpc_id || 'aws_vpc.main.id'}

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name        = "\${var.project_name}-private-rt"
    Environment = var.environment
    Type        = "Private"
  }
}\` : ''}

# Route Table Associations
\${params.public_route_table === 'true' ? \`resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}\` : ''}

\${params.private_route_table === 'true' ? \`resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}\` : ''}`,

  internet_gateway: (params: Record<string, string>) => `# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = \${params.vpc_id || 'aws_vpc.main.id'}

  tags = {
    Name        = "\${var.project_name}-igw"
    Environment = var.environment
  }
}`,

  nat_gateway: (params: Record<string, string>) => `# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
  
  tags = {
    Name        = "\${var.project_name}-nat-eip"
    Environment = var.environment
  }
  
  depends_on = [aws_internet_gateway.main]
}

# NAT Gateway
resource "aws_nat_gateway" "main" {
  allocation_id = \${params.allocation_id || 'aws_eip.nat.id'}
  subnet_id     = \${params.subnet_id || 'aws_subnet.public[0].id'}

  tags = {
    Name        = "\${var.project_name}-nat-gateway"
    Environment = var.environment
  }
  
  depends_on = [aws_internet_gateway.main]
}`,

  // Continue with existing Batch, ECS templates...
  batch_job_queue: (params: Record<string, string>) => `# AWS Batch Job Queue
resource "aws_batch_job_queue" "main" {
  name     = "\${params.job_queue_name || 'my-job-queue'}"
  state    = "ENABLED"
  priority = \${params.priority || '1'}

  compute_environment_order {
    order               = 1
    compute_environment = aws_batch_compute_environment.main.arn
  }

  tags = {
    Name        = "\${params.job_queue_name || 'my-job-queue'}"
    Environment = var.environment
  }
}`,

  batch_compute_environment: (params: Record<string, string>) => `# AWS Batch Compute Environment
resource "aws_batch_compute_environment" "main" {
  compute_environment_name = "\${params.compute_environment_name || 'my-compute-env'}"
  type                     = "MANAGED"
  state                    = "ENABLED"

  compute_resources {
    type                = "EC2"
    min_vcpus          = \${params.min_vcpus || '0'}
    max_vcpus          = \${params.max_vcpus || '10'}
    desired_vcpus      = \${params.desired_vcpus || '2'}
    instance_types     = ["\${params.instance_type || 'm5.large'}"]
    
    ec2_configuration {
      image_type = "ECS_AL2"
    }

    subnets = aws_subnet.private[*].id
    
    security_group_ids = [
      aws_security_group.batch.id
    ]

    instance_role = aws_iam_instance_profile.ecs_instance_role.arn
  }

  service_role = aws_iam_role.aws_batch_service_role.arn

  tags = {
    Name        = "\${params.compute_environment_name || 'my-compute-env'}"
    Environment = var.environment
  }
}

# Security Group for Batch
resource "aws_security_group" "batch" {
  name_prefix = "\${var.project_name}-batch-"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${var.project_name}-batch-sg"
    Environment = var.environment
  }
}`,

  ecs_cluster: (params: Record<string, string>) => `# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "\${params.cluster_name || 'my-ecs-cluster'}"

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  tags = {
    Name        = "\${params.cluster_name || 'my-ecs-cluster'}"
    Environment = var.environment
  }
}`,

  ecs_service: (params: Record<string, string>) => `# ECS Service
resource "aws_ecs_service" "main" {
  name            = "\${params.service_name || 'my-ecs-service'}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = \${params.desired_count || '1'}

  launch_type = "FARGATE"

  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs_service.id]
  }

  tags = {
    Name        = "\${params.service_name || 'my-ecs-service'}"
    Environment = var.environment
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = "\${var.project_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name  = "app"
      image = "\${params.container_image || 'nginx:latest'}"

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/\${var.project_name}"
  retention_in_days = 14

  tags = {
    Environment = var.environment
  }
}

# Data source for current region
data "aws_region" "current" {}`,

  vpn_connection: (params: Record<string, string>) => `# VPN Connection
resource "aws_vpn_connection" "main" {
  customer_gateway_id = aws_customer_gateway.main.id
  type               = "ipsec.1"
  static_routes_only = true

  tags = {
    Name        = "\${var.project_name}-vpn"
    Environment = var.environment
  }
}

# Customer Gateway
resource "aws_customer_gateway" "main" {
  bgp_asn    = 65000
  ip_address = "\${params.customer_gateway_ip}"
  type       = "ipsec.1"

  tags = {
    Name        = "\${var.project_name}-cgw"
    Environment = var.environment
  }
}

# VPN Gateway
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "\${var.project_name}-vgw"
    Environment = var.environment
  }
}`
};

export const azureTemplates = {
  // Core networking templates
  virtual_network: (params: Record<string, string>) => `# Azure Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "\${params.vnet_name || 'my-vnet'}"
  address_space       = ["\${params.address_space || '10.0.0.0/16'}"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  \${params.dns_servers ? \`dns_servers = [\${params.dns_servers.split(',').map(ip => \`"\${ip.trim()}"\`).join(', ')}]\` : ''}

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}`,

  subnet: (params: Record<string, string>) => `# Azure Subnet
resource "azurerm_subnet" "main" {
  name                 = "\${params.subnet_name || 'my-subnet'}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = "\${params.virtual_network_name || azurerm_virtual_network.main.name}"
  address_prefixes     = ["\${params.address_prefixes || '10.0.1.0/24'}"]
}`,

  route_table: (params: Record<string, string>) => `# Azure Route Table
resource "azurerm_route_table" "main" {
  name                          = "\${params.route_table_name || 'my-route-table'}"
  location                      = azurerm_resource_group.main.location
  resource_group_name           = azurerm_resource_group.main.name
  disable_bgp_route_propagation = \${params.disable_bgp_route_propagation || 'false'}

  route {
    name           = "default"
    address_prefix = "0.0.0.0/0"
    next_hop_type  = "Internet"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}`,

  nat_gateway: (params: Record<string, string>) => `# Azure Public IP for NAT Gateway
resource "azurerm_public_ip" "nat" {
  name                = "\${params.nat_gateway_name || 'my-nat-gateway'}-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                = "Standard"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# Azure NAT Gateway
resource "azurerm_nat_gateway" "main" {
  name                    = "\${params.nat_gateway_name || 'my-nat-gateway'}"
  location                = azurerm_resource_group.main.location
  resource_group_name     = azurerm_resource_group.main.name
  sku_name               = "\${params.sku_name || 'Standard'}"
  idle_timeout_in_minutes = \${params.idle_timeout_in_minutes || '4'}

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# Associate Public IP with NAT Gateway
resource "azurerm_nat_gateway_public_ip_association" "main" {
  nat_gateway_id       = azurerm_nat_gateway.main.id
  public_ip_address_id = azurerm_public_ip.nat.id
}`,

  // Enhanced Virtual Machine template
  virtual_machine: (params: Record<string, string>) => `# Azure Network Interface
resource "azurerm_network_interface" "main" {
  name                = "\${params.vm_name || 'my-vm'}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm.id
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# Azure Public IP for VM
resource "azurerm_public_ip" "vm" {
  name                = "\${params.vm_name || 'my-vm'}-pip"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  allocation_method   = "Static"
  sku                = "Standard"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# Azure Virtual Machine
resource "azurerm_linux_virtual_machine" "main" {
  name                = "\${params.vm_name || 'my-vm'}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = "\${params.vm_size || 'Standard_B2s'}"
  admin_username      = "\${params.admin_username || 'azureuser'}"

  disable_password_authentication = \${params.disable_password_authentication || 'true'}

  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]

  admin_ssh_key {
    username   = "\${params.admin_username || 'azureuser'}"
    public_key = file("~/.ssh/id_rsa.pub") # Update path as needed
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  \${params.source_image_reference === 'Ubuntu' ? \`source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }\` : params.source_image_reference === 'CentOS' ? \`source_image_reference {
    publisher = "OpenLogic"
    offer     = "CentOS"
    sku       = "8_5-gen2"
    version   = "latest"
  }\` : params.source_image_reference === 'RHEL' ? \`source_image_reference {
    publisher = "RedHat"
    offer     = "RHEL"
    sku       = "8-lvm-gen2"
    version   = "latest"
  }\` : params.source_image_reference === 'Windows' ? \`source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-Datacenter"
    version   = "latest"
  }\` : \`source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }\`}

  tags = {
    Project     = var.project_name
    Environment = var.environment
    VMSize      = "\${params.vm_size || 'Standard_B2s'}"
  }
}`,

  container_group: (params: Record<string, string>) => `# Azure Container Group
resource "azurerm_container_group" "main" {
  name                = "\${params.container_group_name || 'my-container-group'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  ip_address_type     = "Public"
  os_type             = "\${params.os_type || 'Linux'}"

  container {
    name   = "app"
    image  = "\${params.container_image || 'nginx:latest'}"
    cpu    = "\${params.cpu || '0.5'}"
    memory = "\${params.memory || '1.5'}"

    ports {
      port     = 80
      protocol = "TCP"
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}`,

  container_registry: (params: Record<string, string>) => `# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "\${params.registry_name || 'mycontainerregistry'}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                = "\${params.sku || 'Basic'}"
  admin_enabled      = \${params.admin_enabled || 'false'}

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}`,

  key_vault: (params: Record<string, string>) => `# Azure Key Vault
resource "azurerm_key_vault" "main" {
  name                = "\${params.key_vault_name || 'my-key-vault'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id          = data.azurerm_client_config.current.tenant_id
  sku_name           = "\${params.sku_name || 'standard'}"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get",
    ]

    secret_permissions = [
      "Get",
    ]

    storage_permissions = [
      "Get",
    ]
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

data "azurerm_client_config" "current" {}`
};

export const gcpTemplates = {
  // Core networking templates
  compute_network: (params: Record<string, string>) => `# Google Cloud VPC Network
resource "google_compute_network" "main" {
  name                    = "\${params.network_name || 'my-vpc-network'}"
  auto_create_subnetworks = \${params.auto_create_subnetworks || 'false'}
  routing_mode           = "\${params.routing_mode || 'REGIONAL'}"

  description = "VPC network for \${var.project_name}"
}`,

  compute_subnetwork: (params: Record<string, string>) => `# Google Cloud Subnetwork
resource "google_compute_subnetwork" "main" {
  name          = "\${params.subnetwork_name || 'my-subnetwork'}"
  ip_cidr_range = "\${params.ip_cidr_range || '10.0.1.0/24'}"
  region        = "\${params.region || var.region}"
  network       = "\${params.network || google_compute_network.main.id}"

  description = "Subnetwork for \${var.project_name}"
}`,

  compute_route: (params: Record<string, string>) => `# Google Cloud Route
resource "google_compute_route" "main" {
  name             = "\${params.route_name || 'my-route'}"
  dest_range       = "\${params.dest_range || '0.0.0.0/0'}"
  network          = "\${params.network || google_compute_network.main.name}"
  next_hop_gateway = "\${params.next_hop_gateway || 'default-internet-gateway'}"
  priority         = 1000

  description = "Custom route for \${var.project_name}"
}`,

  // Enhanced Compute Instance with comprehensive machine types
  compute_instance: (params: Record<string, string>) => `# Google Cloud Compute Instance
resource "google_compute_instance" "main" {
  name         = "\${params.instance_name || 'my-instance'}"
  machine_type = "\${params.machine_type || 'e2-medium'}"
  zone         = "\${params.zone || var.zone}"

  boot_disk {
    initialize_params {
      image = "\${params.source_image || 'debian-cloud/debian-11'}"
      size  = \${params.disk_size_gb || '20'}
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = google_compute_network.main.name
    subnetwork = google_compute_subnetwork.main.name
    
    access_config {
      // Ephemeral external IP
    }
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo "<h1>Hello from \${var.project_name} - \${params.instance_name || 'my-instance'}</h1>" > /var/www/html/index.html
    echo "<p>Machine Type: \${params.machine_type || 'e2-medium'}</p>" >> /var/www/html/index.html
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    project      = var.project_name
    environment  = var.environment
    machine-type = replace("\${params.machine_type || 'e2-medium'}", "-", "_")
  }

  tags = ["web-server", "http-server"]
}

# Firewall rule to allow HTTP traffic
resource "google_compute_firewall" "default" {
  name    = "\${var.project_name}-allow-http"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80", "22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web-server"]
}`,

  compute_instance_template: (params: Record<string, string>) => `# Google Cloud Compute Instance Template
resource "google_compute_instance_template" "main" {
  name_prefix  = "\${params.template_name || 'my-instance-template'}-"
  machine_type = "\${params.machine_type || 'e2-medium'}"
  region       = var.region

  disk {
    source_image = "\${params.source_image || 'debian-cloud/debian-11'}"
    auto_delete  = true
    boot         = true
    disk_size_gb = \${params.disk_size_gb || '20'}
    disk_type    = "pd-standard"
  }

  network_interface {
    network    = google_compute_network.main.name
    subnetwork = google_compute_subnetwork.main.name
    
    access_config {
      // Include this section to give the VM an external IP address
    }
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo "<h1>Template Instance - \${var.project_name}</h1>" > /var/www/html/index.html
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }

  lifecycle {
    create_before_destroy = true
  }

  labels = {
    project      = var.project_name
    environment  = var.environment
    machine-type = replace("\${params.machine_type || 'e2-medium'}", "-", "_")
  }

  tags = ["web-server", "template-instance"]
}`,

  app_engine_application: (params: Record<string, string>) => `# App Engine Application
resource "google_app_engine_application" "main" {
  project     = "\${params.project_id}"
  location_id = "\${params.location_id || 'us-central'}"
}`,

  cloud_run_service: (params: Record<string, string>) => `# Cloud Run Service
resource "google_cloud_run_service" "main" {
  name     = "\${params.service_name || 'my-cloud-run-service'}"
  location = "\${params.location || 'us-central1'}"

  template {
    spec {
      containers {
        image = "\${params.image || 'gcr.io/cloudrun/hello'}"
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
  bucket      = "\${params.bucket_name}"
  role_entity = [\${params.role_entity?.split(',').map(re => \`"\${re.trim()}"\`).join(', ') || '"READER:allUsers"'}]
}`,

  kms_key_ring: (params: Record<string, string>) => `# KMS Key Ring
resource "google_kms_key_ring" "main" {
  name     = "\${params.key_ring_name || 'my-key-ring'}"
  location = "\${params.location || 'global'}"
}`,

  kms_crypto_key: (params: Record<string, string>) => `# KMS Crypto Key
resource "google_kms_crypto_key" "main" {
  name     = "\${params.crypto_key_name || 'my-crypto-key'}"
  key_ring = google_kms_key_ring.\${params.key_ring || 'main'}.id
  purpose  = "\${params.purpose || 'ENCRYPT_DECRYPT'}"
}`
};