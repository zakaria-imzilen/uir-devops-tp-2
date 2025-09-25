terraform {
  required_version = ">= 1.3.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_compute_instance" "demo_vm" {
  name         = "demo-vm"
  machine_type = "e2-medium"
  zone         = var.zone

  tags = ["devops"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 30
    }
  }

  network_interface {
    network       = "default"
    access_config {} # allocate external IP
  }

  metadata = {
    ssh-keys = "ubuntu:${file(var.ssh_public_key)}"
  }
}

resource "google_compute_firewall" "devops_fw" {
  name    = "devops-fw"
  network = "default"

  // Define allowed source ranges for ingress traffic
  source_ranges = var.allowed_source_ranges

  allow {
    protocol = "tcp"
    ports    = ["22", "8080", "8081", "9000", "3000", "9090"]
  }

  target_tags = ["devops"]
}
