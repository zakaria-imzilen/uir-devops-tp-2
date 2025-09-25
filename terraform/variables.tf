variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "ssh_public_key" {
  description = "Path to SSH public key file"
  type        = string
}

variable "allowed_source_ranges" {
  description = "List of CIDR blocks allowed to access exposed ports"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
