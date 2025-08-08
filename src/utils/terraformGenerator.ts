import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TerraformModule, awsModules } from '@/components/ModuleSelector';

interface GenerateOptions {
  provider: string;
  selectedModules: string[];
  parameters: Record<string, Record<string, string>>;
}

// Terraform templates for AWS modules
const templates = {
  aws: {
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
}`
  }
};

const generateVariablesFile = (provider: string) => `# Variables for ${provider.toUpperCase()} infrastructure

variable "project_name" {
  description = "Name of the project, used for resource naming"
  type        = string
  default     = "terraform-generated"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}`;

const generateTerraformVars = (provider: string) => `# Terraform variables file
# Edit these values according to your requirements

project_name = "my-terraform-project"
aws_region   = "us-west-2"
environment  = "dev"`;

const generateOutputsFile = (selectedModules: string[]) => {
  let outputs = '# Outputs for generated infrastructure\n\n';
  
  if (selectedModules.includes('vpc')) {
    outputs += `output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

`;
  }

  if (selectedModules.includes('subnet')) {
    outputs += `output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

`;
  }

  if (selectedModules.includes('ec2')) {
    outputs += `output "instance_ids" {
  description = "IDs of EC2 instances"
  value       = aws_instance.main[*].id
}

output "instance_public_ips" {
  description = "Public IP addresses of EC2 instances"
  value       = aws_instance.main[*].public_ip
}

`;
  }

  if (selectedModules.includes('s3')) {
    outputs += `output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.main.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.main.arn
}

`;
  }

  return outputs;
};

const generateMainFile = (provider: string) => `# Main Terraform configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}`;

export async function generateTerraformProject(options: GenerateOptions): Promise<void> {
  const { provider, selectedModules, parameters } = options;
  const zip = new JSZip();
  
  // Create provider folder
  const providerFolder = zip.folder(provider)!;
  
  // Generate main configuration files
  providerFolder.file('main.tf', generateMainFile(provider));
  providerFolder.file('variables.tf', generateVariablesFile(provider));
  providerFolder.file('terraform.tfvars', generateTerraformVars(provider));
  providerFolder.file('outputs.tf', generateOutputsFile(selectedModules));
  
  // Get module data
  const modules = provider === 'aws' ? awsModules : [];
  const selectedModuleData = modules.filter(module => selectedModules.includes(module.id));
  
  // Group modules by category
  const modulesByCategory = selectedModuleData.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, TerraformModule[]>);
  
  // Generate module files by category
  Object.entries(modulesByCategory).forEach(([category, categoryModules]) => {
    const categoryFolder = providerFolder.folder(category)!;
    
    categoryModules.forEach(module => {
      const moduleParams = parameters[module.id] || {};
      const template = templates[provider as keyof typeof templates]?.[module.id as keyof typeof templates.aws];
      
      if (template) {
        const content = template(moduleParams);
        categoryFolder.file(`${module.id}.tf`, content);
      }
    });
  });
  
  // Generate README
  const readmeContent = `# ${provider.toUpperCase()} Terraform Infrastructure

This Terraform configuration was generated using the Terraform Project Generator.

## Structure

- \`main.tf\` - Main Terraform configuration and provider setup
- \`variables.tf\` - Variable definitions
- \`terraform.tfvars\` - Variable values (edit as needed)
- \`outputs.tf\` - Output definitions
- \`networking/\` - Networking resources (VPC, subnets, etc.)
- \`compute/\` - Compute resources (EC2, etc.)
- \`storage/\` - Storage resources (S3, etc.)
- \`security/\` - Security resources (IAM, security groups, etc.)

## Usage

1. Install Terraform: https://www.terraform.io/downloads.html
2. Configure AWS credentials: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html
3. Edit \`terraform.tfvars\` with your desired values
4. Run the following commands:

\`\`\`bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
\`\`\`

## Generated Modules

${selectedModules.map(moduleId => {
  const module = modules.find(m => m.id === moduleId);
  return module ? `- **${module.name}**: ${module.description}` : '';
}).filter(Boolean).join('\n')}

## Cleanup

To destroy the infrastructure:

\`\`\`bash
terraform destroy
\`\`\`
`;
  
  providerFolder.file('README.md', readmeContent);
  
  // Generate and download zip file
  const content = await zip.generateAsync({ type: 'blob' });
  const fileName = `terraform-${provider}-${new Date().toISOString().split('T')[0]}.zip`;
  saveAs(content, fileName);
}