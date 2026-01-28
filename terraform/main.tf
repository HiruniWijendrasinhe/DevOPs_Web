# 1. Specify the AWS provider and region
provider "aws" {
  region = "us-east-1" # Change to your AWS region
}

# 2. Existing security group is used; new security group resource commented out
# resource "aws_security_group" "web_sg" {
#   name        = "web_sg"
#   description = "Allow SSH and HTTP"
#   ingress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # SSH from anywhere (not secure for production)
#   }
#   ingress {
#     from_port   = 80
#     to_port     = 80
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # HTTP from anywhere
#   }
#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
# }

# 3. Launch an EC2 instance
resource "aws_instance" "web" {
  ami           = "ami-0532be01f26a3de55" # Actual AMI from your instance
  instance_type = "t3.micro" # Actual instance type
  key_name      = "devops-key" # Actual key pair name
  security_groups = ["launch-wizard-1"] # Actual security group

  tags = {
    Name = "My Web Server" # Actual tag
  }
}

# 4. Existing Elastic IP is used; new Elastic IP resource commented out
# resource "aws_eip" "web_eip" {
#   instance = aws_instance.web.id
# }