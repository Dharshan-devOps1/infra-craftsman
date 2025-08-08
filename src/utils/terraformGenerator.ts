import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TerraformModule } from '@/components/ModuleSelector';
import { awsModules, azureModules, gcpModules } from '@/data/modules';
import { awsTemplates, azureTemplates, gcpTemplates, awsMissingTemplates, azureMissingTemplates } from './terraformTemplates';

interface GenerateOptions {
  provider: string;
  selectedModules: string[];
  parameters: Record<string, Record<string, string>>;
}



// Provider-specific templates mapping
const templates = {
  aws: awsTemplates,
  azure: azureTemplates,
  gcp: gcpTemplates
};

const generateVariablesFile = (provider: string) => {
  const baseVariables = `# Variables for ${provider.toUpperCase()} infrastructure

variable "project_name" {
  description = "Name of the project, used for resource naming"
  type        = string
  default     = "terraform-generated"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}`;

  if (provider === 'aws') {
    return baseVariables + `

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}`;
  } else if (provider === 'azure') {
    return baseVariables + `

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "terraform-rg"
}`;
  } else if (provider === 'gcp') {
    return baseVariables + `

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone for resources"
  type        = string
  default     = "us-central1-a"
}`;
  }
  
  return baseVariables;
};

const generateTerraformVars = (provider: string) => {
  let vars = `# Terraform variables file
# Edit these values according to your requirements

project_name = "my-terraform-project"
environment  = "dev"`;

  if (provider === 'aws') {
    vars += `\naws_region   = "us-west-2"`;
  } else if (provider === 'azure') {
    vars += `\nlocation            = "East US"
resource_group_name = "terraform-rg"`;
  } else if (provider === 'gcp') {
    vars += `\nproject_id = "my-gcp-project"
region     = "us-central1"
zone       = "us-central1-a"`;
  }

  return vars;
};

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

const generateMainFile = (provider: string) => {
  if (provider === 'aws') {
    return `# Main Terraform configuration

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
  } else if (provider === 'azure') {
    return `# Main Terraform configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}`;
  } else if (provider === 'gcp') {
    return `# Main Terraform configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}`;
  }
  
  return '';
};

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
  const getModules = () => {
    switch (provider) {
      case 'aws': return awsModules;
      case 'azure': return azureModules;
      case 'gcp': return gcpModules;
      default: return [];
    }
  };
  
  const modules = getModules();
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
      
      // Get the appropriate template function for this provider and module
      let template: ((params: Record<string, string>) => string) | undefined;
      
      if (provider === 'aws') {
        template = awsTemplates[module.id as keyof typeof awsTemplates] || 
                  awsMissingTemplates[module.id as keyof typeof awsMissingTemplates];
      } else if (provider === 'azure') {
        template = azureTemplates[module.id as keyof typeof azureTemplates] || 
                  azureMissingTemplates[module.id as keyof typeof azureMissingTemplates];
      } else if (provider === 'gcp') {
        template = gcpTemplates[module.id as keyof typeof gcpTemplates];
      }
      
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