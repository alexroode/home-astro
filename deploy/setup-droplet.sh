#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "usage: setup-droplet.sh <your username> \"<your ssh public key>\" \"<pipeline ssh public key>\"" >&2
  exit 1
fi
admin="$1"
admin_key="$2"
pipeline_key="$3"

add_key() {
  local home
  home="$(getent passwd "$1" | cut -d: -f6)"
  install -d -m 700 -o "$1" -g "$1" "$home/.ssh"
  touch "$home/.ssh/authorized_keys"
  grep -qxF "$2" "$home/.ssh/authorized_keys" || echo "$2" >> "$home/.ssh/authorized_keys"
  chown "$1:$1" "$home/.ssh/authorized_keys"
  chmod 600 "$home/.ssh/authorized_keys"
}

if ! swapon --show | grep -q '^/swapfile'; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

id "$admin" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$admin"
usermod -aG sudo "$admin"
add_key "$admin" "$admin_key"
if passwd -S "$admin" | grep -qE "^$admin (L|NP) "; then
  echo "Set a sudo password for $admin:"
  passwd "$admin"
fi

mkdir -p /etc/docker
docker_config='{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }'
if [ "$(cat /etc/docker/daemon.json 2>/dev/null)" != "$docker_config" ]; then
  echo "$docker_config" > /etc/docker/daemon.json
  if systemctl is-active --quiet docker; then systemctl restart docker; fi
fi
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

apt-get update
apt-get install -y unattended-upgrades
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
cat > /etc/apt/apt.conf.d/52unattended-upgrades-local <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "11:00";
EOF

id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
usermod -aG docker deploy
add_key deploy "$pipeline_key"
add_key deploy "$admin_key"

install -d -o deploy -g deploy \
  /srv/home-astro \
  /srv/home-astro/app \
  /srv/home-astro/media \
  /srv/home-astro/media/audio \
  /srv/home-astro/media/scores \
  /srv/home-astro/downloads

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

cat > /etc/ssh/sshd_config.d/00-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
EOF
sshd -t
systemctl reload ssh || systemctl restart ssh

echo
echo "Droplet ready."
echo "1. In a NEW terminal, check that 'ssh $admin@<droplet>' works before closing this session."
echo "2. Copy media into /srv/home-astro/media and order zips into /srv/home-astro/downloads."
