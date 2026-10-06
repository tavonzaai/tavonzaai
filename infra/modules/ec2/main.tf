resource "aws_instance" "this" {
  ami           = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = var.subnet_id

  vpc_security_group_ids = var.security_group_ids
  iam_instance_profile   = var.iam_instance_profile
  key_name               = var.key_name

  user_data                   = var.user_data
  user_data_replace_on_change = true

  monitoring = var.enable_monitoring

  # Enforce IMDSv2 for security
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
    instance_metadata_tags      = "enabled"
  }

  # Root block device with EBS encryption
  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = var.root_volume_type
    encrypted             = true
    delete_on_termination = true

    tags = merge(var.tags, {
      Name = "${var.instance_name}-root-vol"
    })
  }

  tags = merge(var.tags, {
    Name = var.instance_name
  })
}

resource "aws_eip" "this" {
  count    = var.assign_eip ? 1 : 0
  instance = aws_instance.this.id
  domain   = "vpc"

  tags = merge(var.tags, {
    Name = "${var.instance_name}-eip"
  })
}
