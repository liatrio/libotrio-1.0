#-*- mode: ruby -*-
# vi: set ft=ruby :

# Provisioning script that installs nodejs and sets environment variables
$provision = <<SCRIPT
  yum -y update
  yum groupinstall -y "Development Tools"
  yum install -y wget
  # Install Node/npm
  curl --silent --location https://rpm.nodesource.com/setup_7.x | bash -
  yum install -y nodejs
  # Cleanup
  rm -r dl.fedoraproject.org
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "bento/centos-7.2"
  config.vm.provision "shell", inline: $provision
  # Fix for "SSH auth method" hangups
  config.vm.provider :virtualbox do |v|
    v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    v.customize ['modifyvm', :id, '--cableconnected1', 'on']
    v.customize ['modifyvm', :id, '--cableconnected2', 'on']
  end
end
