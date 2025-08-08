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
}`,

  // Missing templates for networking
  compute_forwarding_rule: (params: Record<string, string>) => `# Compute Forwarding Rule
resource "google_compute_forwarding_rule" "main" {
  name        = "\${params.forwarding_rule_name || 'my-forwarding-rule'}"
  target      = "\${params.target}"
  port_range  = "\${params.port_range || '80'}"
  ip_protocol = "\${params.ip_protocol || 'TCP'}"
  region      = "\${params.region || 'us-central1'}"
}`,

  compute_target_https_proxy: (params: Record<string, string>) => `# HTTPS Target Proxy
resource "google_compute_target_https_proxy" "main" {
  name             = "\${params.proxy_name || 'my-https-proxy'}"
  url_map          = "\${params.url_map}"
  ssl_certificates = ["\${params.ssl_certificate}"]
}`,

  compute_managed_ssl_certificate: (params: Record<string, string>) => `# Managed SSL Certificate
resource "google_compute_managed_ssl_certificate" "main" {
  name = "\${params.cert_name || 'my-ssl-cert'}"

  managed {
    domains = ["\${params.domains || 'example.com'}"]
  }
}`,

  storage_bucket_object: (params: Record<string, string>) => `# Storage Bucket Object
resource "google_storage_bucket_object" "main" {
  name   = "\${params.object_name || 'my-object'}"
  bucket = "\${params.bucket_name}"
  source = "\${params.source_file || 'path/to/file'}"
}`,

  bigquery_dataset: (params: Record<string, string>) => `# BigQuery Dataset
resource "google_bigquery_dataset" "main" {
  dataset_id  = "\${params.dataset_id || 'my_dataset'}"
  description = "\${params.description || 'My BigQuery dataset'}"
  location    = "\${params.location || 'US'}"

  delete_contents_on_destroy = \${params.delete_contents_on_destroy || 'false'}
}`,

  bigtable_instance: (params: Record<string, string>) => `# Bigtable Instance
resource "google_bigtable_instance" "main" {
  name = "\${params.instance_name || 'my-bigtable-instance'}"

  cluster {
    cluster_id   = "\${params.cluster_id || 'my-cluster'}"
    zone         = "\${params.zone || 'us-central1-b'}"
    num_nodes    = \${params.num_nodes || '1'}
    storage_type = "\${params.storage_type || 'SSD'}"
  }

  labels = {
    project     = var.project_name
    environment = var.environment
  }
}`,

  iam_policy: (params: Record<string, string>) => `# IAM Policy
resource "google_iam_policy" "main" {
  binding {
    role = "\${params.role || 'roles/viewer'}"
    members = [
      "\${params.members || 'user:admin@example.com'}"
    ]
  }
}`,

  iam_role: (params: Record<string, string>) => `# Custom IAM Role
resource "google_project_iam_custom_role" "main" {
  role_id     = "\${params.role_id || 'customRole'}"
  title       = "\${params.title || 'Custom Role'}"
  description = "\${params.description || 'A custom role'}"
  permissions = ["\${params.permissions || 'compute.instances.list'}"]
}`,

  monitoring_dashboard: (params: Record<string, string>) => `# Monitoring Dashboard
resource "google_monitoring_dashboard" "main" {
  dashboard_json = jsonencode({
    displayName = "\${params.display_name || 'My Dashboard'}"
    mosaicLayout = {
      tiles = []
    }
  })
}`,

  logging_project_sink: (params: Record<string, string>) => `# Logging Project Sink
resource "google_logging_project_sink" "main" {
  name        = "\${params.sink_name || 'my-sink'}"
  destination = "\${params.destination}"
  filter      = "\${params.filter || 'severity >= ERROR'}"

  unique_writer_identity = true
}`
};

// AWS Templates - Add missing templates
export const awsMissingTemplates = {
  s3: (params: Record<string, string>) => `# S3 Bucket
resource "aws_s3_bucket" "main" {
  bucket = "\${params.bucket_name || 'my-terraform-bucket'}"

  tags = {
    Name        = "\${var.project_name}-bucket"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "\${params.versioning_enabled == 'true' ? 'Enabled' : 'Suspended'}"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "\${params.encryption || 'AES256'}"
    }
  }
}`,

  fargate_task_definition: (params: Record<string, string>) => `# Fargate Task Definition
resource "aws_ecs_task_definition" "fargate" {
  family                   = "\${params.family || 'my-fargate-task'}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "\${params.cpu || '256'}"
  memory                   = "\${params.memory || '512'}"
  execution_role_arn       = aws_iam_role.fargate_execution.arn

  container_definitions = jsonencode([
    {
      name  = "\${params.container_name || 'my-container'}"
      image = "\${params.image || 'nginx:latest'}"
      portMappings = [
        {
          containerPort = \${params.container_port || '80'}
        }
      ]
    }
  ])
}

resource "aws_iam_role" "fargate_execution" {
  name = "\${var.project_name}-fargate-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}`,

  vpn_gateway: (params: Record<string, string>) => `# VPN Gateway
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id
  type   = "ipsec.1"

  tags = {
    Name = "\${var.project_name}-vpn-gateway"
  }
}`,

  customer_gateway: (params: Record<string, string>) => `# Customer Gateway
resource "aws_customer_gateway" "main" {
  bgp_asn    = \${params.bgp_asn || '65000'}
  ip_address = "\${params.ip_address}"
  type       = "ipsec.1"

  tags = {
    Name = "\${var.project_name}-customer-gateway"
  }
}`,

  elb: (params: Record<string, string>) => `# Classic Load Balancer
resource "aws_elb" "main" {
  name            = "\${params.elb_name || 'my-elb'}"
  subnets         = aws_subnet.public[*].id
  security_groups = [aws_security_group.elb.id]

  listener {
    instance_port     = \${params.instance_port || '80'}
    instance_protocol = "\${params.instance_protocol || 'HTTP'}"
    lb_port           = \${params.lb_port || '80'}
    lb_protocol       = "\${params.lb_protocol || 'HTTP'}"
  }

  health_check {
    target              = "\${params.health_check_target || 'HTTP:80/'}"
    interval            = \${params.health_check_interval || '30'}
    healthy_threshold   = \${params.healthy_threshold || '2'}
    unhealthy_threshold = \${params.unhealthy_threshold || '5'}
    timeout             = \${params.health_check_timeout || '5'}
  }

  tags = {
    Name = "\${var.project_name}-elb"
  }
}

resource "aws_security_group" "elb" {
  name_prefix = "\${var.project_name}-elb-"
  vpc_id      = aws_vpc.main.id

  ingress {
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
}`,

  alb: (params: Record<string, string>) => `# Application Load Balancer
resource "aws_lb" "main" {
  name               = "\${params.alb_name || 'my-alb'}"
  internal           = \${params.internal || 'false'}
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = \${params.deletion_protection || 'false'}

  tags = {
    Name = "\${var.project_name}-alb"
  }
}

resource "aws_security_group" "alb" {
  name_prefix = "\${var.project_name}-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`,

  nlb: (params: Record<string, string>) => `# Network Load Balancer
resource "aws_lb" "main" {
  name               = "\${params.nlb_name || 'my-nlb'}"
  internal           = \${params.internal || 'false'}
  load_balancer_type = "network"
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = \${params.deletion_protection || 'false'}

  tags = {
    Name = "\${var.project_name}-nlb"
  }
}`,

  network_acl: (params: Record<string, string>) => `# Network ACL
resource "aws_network_acl" "main" {
  vpc_id = aws_vpc.main.id

  egress {
    protocol   = "\${params.egress_protocol || 'tcp'}"
    rule_no    = \${params.egress_rule_no || '100'}
    action     = "\${params.egress_action || 'allow'}"
    cidr_block = "\${params.egress_cidr || '0.0.0.0/0'}"
    from_port  = \${params.egress_from_port || '80'}
    to_port    = \${params.egress_to_port || '80'}
  }

  ingress {
    protocol   = "\${params.ingress_protocol || 'tcp'}"
    rule_no    = \${params.ingress_rule_no || '100'}
    action     = "\${params.ingress_action || 'allow'}"
    cidr_block = "\${params.ingress_cidr || '0.0.0.0/0'}"
    from_port  = \${params.ingress_from_port || '80'}
    to_port    = \${params.ingress_to_port || '80'}
  }

  tags = {
    Name = "\${var.project_name}-network-acl"
  }
}`,

  glacier_vault: (params: Record<string, string>) => `# Glacier Vault
resource "aws_glacier_vault" "main" {
  name = "\${params.vault_name || 'my-glacier-vault'}"

  notification {
    sns_topic = aws_sns_topic.glacier.arn
    events    = [\${params.notification_events || '"ArchiveRetrievalCompleted","InventoryRetrievalCompleted"'}]
  }

  tags = {
    Name = "\${var.project_name}-glacier-vault"
  }
}

resource "aws_sns_topic" "glacier" {
  name = "\${var.project_name}-glacier-notifications"
}`,

  s3_access_point: (params: Record<string, string>) => `# S3 Access Point
resource "aws_s3_access_point" "main" {
  bucket = aws_s3_bucket.main.bucket
  name   = "\${params.access_point_name || 'my-access-point'}"

  vpc_configuration {
    vpc_id = aws_vpc.main.id
  }

  public_access_block_configuration {
    block_public_acls       = \${params.block_public_acls || 'true'}
    block_public_policy     = \${params.block_public_policy || 'true'}
    ignore_public_acls      = \${params.ignore_public_acls || 'true'}
    restrict_public_buckets = \${params.restrict_public_buckets || 'true'}
  }
}`,

  rds_cluster: (params: Record<string, string>) => `# RDS Cluster
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "\${params.cluster_identifier || 'my-aurora-cluster'}"
  engine                  = "\${params.engine || 'aurora-mysql'}"
  engine_version          = "\${params.engine_version || '5.7.mysql_aurora.2.07.2'}"
  availability_zones      = data.aws_availability_zones.available.names
  database_name           = "\${params.database_name || 'mydb'}"
  master_username         = "\${params.master_username || 'admin'}"
  master_password         = "\${params.master_password || 'changeme123!'}"
  backup_retention_period = \${params.backup_retention_period || '5'}
  preferred_backup_window = "\${params.backup_window || '07:00-09:00'}"
  skip_final_snapshot     = \${params.skip_final_snapshot || 'true'}

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  tags = {
    Name = "\${var.project_name}-rds-cluster"
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "\${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "\${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "\${var.project_name}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`,

  redshift_cluster: (params: Record<string, string>) => `# Redshift Cluster
resource "aws_redshift_cluster" "main" {
  cluster_identifier        = "\${params.cluster_identifier || 'my-redshift-cluster'}"
  database_name             = "\${params.database_name || 'mydb'}"
  master_username           = "\${params.master_username || 'admin'}"
  master_password           = "\${params.master_password || 'changeme123!'}"
  node_type                 = "\${params.node_type || 'dc2.large'}"
  cluster_type              = "\${params.cluster_type || 'single-node'}"
  number_of_nodes           = \${params.number_of_nodes || '1'}
  
  vpc_security_group_ids    = [aws_security_group.redshift.id]
  cluster_subnet_group_name = aws_redshift_subnet_group.main.name
  
  skip_final_snapshot = \${params.skip_final_snapshot || 'true'}

  tags = {
    Name = "\${var.project_name}-redshift-cluster"
  }
}

resource "aws_redshift_subnet_group" "main" {
  name       = "\${var.project_name}-redshift-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "\${var.project_name}-redshift-subnet-group"
  }
}

resource "aws_security_group" "redshift" {
  name_prefix = "\${var.project_name}-redshift-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5439
    to_port     = 5439
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }
}`,

  iam_instance_profile: (params: Record<string, string>) => `# IAM Instance Profile
resource "aws_iam_instance_profile" "main" {
  name = "\${params.profile_name || 'my-instance-profile'}"
  role = aws_iam_role.instance.name
}

resource "aws_iam_role" "instance" {
  name = "\${params.role_name || 'my-instance-role'}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}`,

  iam_policy_attachment: (params: Record<string, string>) => `# IAM Policy Attachment
resource "aws_iam_role_policy_attachment" "main" {
  role       = "\${params.role_name}"
  policy_arn = "\${params.policy_arn || 'arn:aws:iam::aws:policy/ReadOnlyAccess'}"
}`,

  organizations_account: (params: Record<string, string>) => `# Organizations Account
resource "aws_organizations_account" "main" {
  name  = "\${params.account_name || 'my-account'}"
  email = "\${params.email}"
  
  parent_id = "\${params.parent_id || aws_organizations_organizational_unit.main.id}"

  tags = {
    Environment = var.environment
  }
}`,

  organizations_organizational_unit: (params: Record<string, string>) => `# Organizational Unit
resource "aws_organizations_organizational_unit" "main" {
  name      = "\${params.ou_name || 'my-organizational-unit'}"
  parent_id = "\${params.parent_id}"

  tags = {
    Environment = var.environment
  }
}`,

  cloudtrail: (params: Record<string, string>) => `# CloudTrail
resource "aws_cloudtrail" "main" {
  depends_on = [aws_s3_bucket_policy.cloudtrail]

  name           = "\${params.trail_name || 'my-cloudtrail'}"
  s3_bucket_name = aws_s3_bucket.cloudtrail.bucket

  event_selector {
    read_write_type                 = "\${params.read_write_type || 'All'}"
    include_management_events       = \${params.include_management_events || 'true'}

    data_resource {
      type   = "AWS::S3::Object"
      values = ["\${aws_s3_bucket.cloudtrail.arn}/*"]
    }
  }

  tags = {
    Name = "\${var.project_name}-cloudtrail"
  }
}

resource "aws_s3_bucket" "cloudtrail" {
  bucket        = "\${var.project_name}-cloudtrail-logs"
  force_destroy = true
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail.arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "\${aws_s3_bucket.cloudtrail.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}`,

  config_rule: (params: Record<string, string>) => `# Config Rule
resource "aws_config_config_rule" "main" {
  name = "\${params.rule_name || 'my-config-rule'}"

  source {
    owner             = "\${params.source_owner || 'AWS'}"
    source_identifier = "\${params.source_identifier || 'S3_BUCKET_PUBLIC_WRITE_PROHIBITED'}"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_configuration_recorder" "main" {
  name     = "\${var.project_name}-recorder"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported                 = \${params.all_supported || 'true'}
    include_global_resource_types = \${params.include_global_resources || 'true'}
  }
}

resource "aws_iam_role" "config" {
  name = "\${var.project_name}-config-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
      }
    ]
  })
}`,

  sns_topic: (params: Record<string, string>) => `# SNS Topic
resource "aws_sns_topic" "main" {
  name = "\${params.topic_name || 'my-sns-topic'}"

  tags = {
    Name = "\${var.project_name}-sns-topic"
  }
}

resource "aws_sns_topic_subscription" "email" {
  count     = \${params.email_endpoint != "" ? 1 : 0}
  topic_arn = aws_sns_topic.main.arn
  protocol  = "email"
  endpoint  = "\${params.email_endpoint}"
}`,

  sqs_queue: (params: Record<string, string>) => `# SQS Queue
resource "aws_sqs_queue" "main" {
  name                      = "\${params.queue_name || 'my-sqs-queue'}"
  delay_seconds             = \${params.delay_seconds || '90'}
  max_message_size          = \${params.max_message_size || '2048'}
  message_retention_seconds = \${params.message_retention_seconds || '86400'}
  visibility_timeout_seconds = \${params.visibility_timeout_seconds || '300'}

  tags = {
    Name = "\${var.project_name}-sqs-queue"
  }
}`,

  waf_web_acl: (params: Record<string, string>) => `# WAF Web ACL
resource "aws_wafv2_web_acl" "main" {
  name  = "\${params.web_acl_name || 'my-web-acl'}"
  scope = "\${params.scope || 'REGIONAL'}"

  default_action {
    allow {}
  }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "CommonRuleSetMetric"
      sampled_requests_enabled    = true
    }
  }

  tags = {
    Name = "\${var.project_name}-web-acl"
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                 = "WebAclMetric"
    sampled_requests_enabled    = true
  }
}`,

  shield_protection: (params: Record<string, string>) => `# Shield Protection
resource "aws_shield_protection" "main" {
  name         = "\${params.protection_name || 'my-shield-protection'}"
  resource_arn = "\${params.resource_arn}"
}`
};

// Azure Templates - Add missing templates  
export const azureMissingTemplates = {
  application_gateway: (params: Record<string, string>) => `# Application Gateway Public IP
resource "azurerm_public_ip" "app_gateway" {
  name                = "\${params.public_ip_name || 'app-gateway-ip'}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  allocation_method   = "Static"
  sku                 = "Standard"
}

# Application Gateway
resource "azurerm_application_gateway" "main" {
  name                = "\${params.app_gateway_name || 'my-app-gateway'}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  sku {
    name     = "\${params.sku_name || 'Standard_v2'}"
    tier     = "\${params.sku_tier || 'Standard_v2'}"
    capacity = \${params.capacity || '2'}
  }

  gateway_ip_configuration {
    name      = "my-gateway-ip-configuration"
    subnet_id = azurerm_subnet.main.id
  }

  frontend_port {
    name = "http"
    port = 80
  }

  frontend_ip_configuration {
    name                 = "frontend"
    public_ip_address_id = azurerm_public_ip.app_gateway.id
  }

  backend_address_pool {
    name = "backend"
  }

  backend_http_settings {
    name                  = "http"
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 60
  }

  http_listener {
    name                           = "listener"
    frontend_ip_configuration_name = "frontend"
    frontend_port_name             = "http"
    protocol                       = "Http"
  }

  request_routing_rule {
    name                       = "rule"
    rule_type                  = "Basic"
    http_listener_name         = "listener"
    backend_address_pool_name  = "backend"
    backend_http_settings_name = "http"
  }
}`,

  firewall: (params: Record<string, string>) => `# Azure Firewall Public IP
resource "azurerm_public_ip" "firewall" {
  name                = "\${params.firewall_ip_name || 'firewall-ip'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

# Azure Firewall
resource "azurerm_firewall" "main" {
  name                = "\${params.firewall_name || 'my-firewall'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku_name            = "\${params.sku_name || 'AZFW_VNet'}"
  sku_tier            = "\${params.sku_tier || 'Standard'}"

  ip_configuration {
    name                 = "configuration"
    subnet_id            = azurerm_subnet.firewall.id
    public_ip_address_id = azurerm_public_ip.firewall.id
  }
}

# Firewall Subnet
resource "azurerm_subnet" "firewall" {
  name                 = "AzureFirewallSubnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["\${params.firewall_subnet_cidr || '10.0.3.0/26'}"]
}`,

  vpn_gateway: (params: Record<string, string>) => `# VPN Gateway Public IP
resource "azurerm_public_ip" "vpn_gateway" {
  name                = "\${params.vpn_gateway_ip_name || 'vpn-gateway-ip'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Dynamic"
}

# VPN Gateway
resource "azurerm_virtual_network_gateway" "main" {
  name                = "\${params.vpn_gateway_name || 'my-vpn-gateway'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  type     = "Vpn"
  vpn_type = "\${params.vpn_type || 'RouteBased'}"

  active_active = \${params.active_active || 'false'}
  enable_bgp    = \${params.enable_bgp || 'false'}
  sku           = "\${params.sku || 'VpnGw1'}"

  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.vpn_gateway.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.gateway.id
  }
}

# Gateway Subnet
resource "azurerm_subnet" "gateway" {
  name                 = "GatewaySubnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["\${params.gateway_subnet_cidr || '10.0.4.0/27'}"]
}`,

  express_route_circuit: (params: Record<string, string>) => `# ExpressRoute Circuit
resource "azurerm_express_route_circuit" "main" {
  name                  = "\${params.circuit_name || 'my-expressroute-circuit'}"
  resource_group_name   = azurerm_resource_group.main.name
  location              = azurerm_resource_group.main.location
  service_provider_name = "\${params.service_provider_name}"
  peering_location      = "\${params.peering_location}"
  bandwidth_in_mbps     = \${params.bandwidth_in_mbps || '50'}

  sku {
    tier   = "\${params.sku_tier || 'Standard'}"
    family = "\${params.sku_family || 'MeteredData'}"
  }

  tags = {
    environment = var.environment
  }
}`,

  storage_share: (params: Record<string, string>) => `# Storage Share
resource "azurerm_storage_share" "main" {
  name                 = "\${params.share_name || 'my-share'}"
  storage_account_name = azurerm_storage_account.main.name
  quota                = \${params.quota || '50'}
  
  metadata = {
    environment = var.environment
  }
}`,

  blob_container: (params: Record<string, string>) => `# Blob Container
resource "azurerm_storage_container" "main" {
  name                  = "\${params.container_name || 'my-container'}"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "\${params.access_type || 'private'}"
}`,

  postgresql_server: (params: Record<string, string>) => `# PostgreSQL Server
resource "azurerm_postgresql_server" "main" {
  name                = "\${params.server_name || 'my-postgresql-server'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  administrator_login          = "\${params.admin_login || 'adminuser'}"
  administrator_login_password = "\${params.admin_password || 'H@Sh1CoR3!'}"

  sku_name   = "\${params.sku_name || 'B_Gen5_2'}"
  version    = "\${params.postgres_version || '11'}"
  storage_mb = \${params.storage_mb || '5120'}

  backup_retention_days        = \${params.backup_retention_days || '7'}
  geo_redundant_backup_enabled = \${params.geo_redundant_backup || 'false'}
  auto_grow_enabled            = \${params.auto_grow || 'true'}

  public_network_access_enabled    = \${params.public_access || 'false'}
  ssl_enforcement_enabled          = \${params.ssl_enforcement || 'true'}
  ssl_minimal_tls_version_enforced = "\${params.min_tls_version || 'TLS1_2'}"

  tags = {
    environment = var.environment
  }
}`,

  mariadb_server: (params: Record<string, string>) => `# MariaDB Server
resource "azurerm_mariadb_server" "main" {
  name                = "\${params.server_name || 'my-mariadb-server'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  administrator_login          = "\${params.admin_login || 'adminuser'}"
  administrator_login_password = "\${params.admin_password || 'H@Sh1CoR3!'}"

  sku_name   = "\${params.sku_name || 'B_Gen5_2'}"
  version    = "\${params.mariadb_version || '10.3'}"
  storage_mb = \${params.storage_mb || '5120'}

  backup_retention_days        = \${params.backup_retention_days || '7'}
  geo_redundant_backup_enabled = \${params.geo_redundant_backup || 'false'}
  auto_grow_enabled            = \${params.auto_grow || 'true'}

  public_network_access_enabled    = \${params.public_access || 'false'}
  ssl_enforcement_enabled          = \${params.ssl_enforcement || 'true'}
  ssl_minimal_tls_version_enforced = "\${params.min_tls_version || 'TLS1_2'}"

  tags = {
    environment = var.environment
  }
}`,

  cosmosdb_sql_container: (params: Record<string, string>) => `# Cosmos DB Account
resource "azurerm_cosmosdb_account" "main" {
  name                = "\${params.cosmosdb_account_name || 'my-cosmosdb-account'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level       = "\${params.consistency_level || 'BoundedStaleness'}"
    max_interval_in_seconds = \${params.max_interval_in_seconds || '300'}
    max_staleness_prefix    = \${params.max_staleness_prefix || '100000'}
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  tags = {
    environment = var.environment
  }
}

# Cosmos DB SQL Database
resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "\${params.database_name || 'my-database'}"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  throughput          = \${params.database_throughput || '400'}
}

# Cosmos DB SQL Container
resource "azurerm_cosmosdb_sql_container" "main" {
  name                  = "\${params.container_name || 'my-container'}"
  resource_group_name   = azurerm_resource_group.main.name
  account_name          = azurerm_cosmosdb_account.main.name
  database_name         = azurerm_cosmosdb_sql_database.main.name
  partition_key_path    = "\${params.partition_key_path || '/definition/id'}"
  partition_key_version = \${params.partition_key_version || '1'}
  throughput            = \${params.container_throughput || '400'}

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/\"_etag\"/?"
    }
  }

  unique_key {
    paths = ["\${params.unique_key_paths || '/definition/idlong', '/definition/idshort'}"]
  }
}`,

  managed_service_identity: (params: Record<string, string>) => `# Managed Service Identity
resource "azurerm_user_assigned_identity" "main" {
  location            = azurerm_resource_group.main.location
  name                = "\${params.identity_name || 'my-managed-identity'}"
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    environment = var.environment
  }
}`,

  role_assignment: (params: Record<string, string>) => `# Role Assignment
resource "azurerm_role_assignment" "main" {
  scope                = "\${params.scope}"
  role_definition_name = "\${params.role_definition_name || 'Reader'}"
  principal_id         = "\${params.principal_id}"
}`,

  log_analytics_solution: (params: Record<string, string>) => `# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "\${params.workspace_name || 'my-log-analytics-workspace'}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "\${params.sku || 'PerGB2018'}"
  retention_in_days   = \${params.retention_in_days || '30'}

  tags = {
    environment = var.environment
  }
}

# Log Analytics Solution
resource "azurerm_log_analytics_solution" "main" {
  solution_name         = "\${params.solution_name || 'ContainerInsights'}"
  location              = azurerm_resource_group.main.location
  resource_group_name   = azurerm_resource_group.main.name
  workspace_resource_id = azurerm_log_analytics_workspace.main.id
  workspace_name        = azurerm_log_analytics_workspace.main.name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/\${params.solution_name || 'ContainerInsights'}"
  }

  tags = {
    environment = var.environment
  }
}`,

  alert_rule_metric: (params: Record<string, string>) => `# Monitor Action Group
resource "azurerm_monitor_action_group" "main" {
  name                = "\${params.action_group_name || 'my-action-group'}"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "\${params.short_name || 'myactiongrp'}"

  email_receiver {
    name          = "sendtoadmin"
    email_address = "\${params.email_address || 'admin@example.com'}"
  }

  tags = {
    environment = var.environment
  }
}

# Metric Alert Rule
resource "azurerm_monitor_metric_alert" "main" {
  name                = "\${params.alert_name || 'my-metric-alert'}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = ["\${params.target_resource_id}"]
  description         = "\${params.description || 'Action will be triggered when cpu usage is greater than 80%'}"

  criteria {
    metric_namespace = "\${params.metric_namespace || 'Microsoft.Compute/virtualMachines'}"
    metric_name      = "\${params.metric_name || 'Percentage CPU'}"
    aggregation      = "\${params.aggregation || 'Average'}"
    operator         = "\${params.operator || 'GreaterThan'}"
    threshold        = \${params.threshold || '80'}
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = {
    environment = var.environment
  }
}`,

  security_center_subscription_pricing: (params: Record<string, string>) => `# Security Center Subscription Pricing
resource "azurerm_security_center_subscription_pricing" "main" {
  tier          = "\${params.tier || 'Standard'}"
  resource_type = "\${params.resource_type || 'VirtualMachines'}"
}`
};