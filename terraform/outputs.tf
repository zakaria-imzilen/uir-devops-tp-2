output "public_ip" {
  description = "Public IP of the demo VM"
  value       = google_compute_instance.demo_vm.network_interface[0].access_config[0].nat_ip
}
