#!/bin/bash
scp -i "co2-prod-comp.pem" -r build ubuntu@ec2-3-15-176-20.us-east-2.compute.amazonaws.com:./
scp -i "co2-prod-comp.pem" package.json ubuntu@ec2-3-15-176-20.us-east-2.compute.amazonaws.com:./build/
ssh -i "co2-prod-comp.pem" ubuntu@ec2-3-15-176-20.us-east-2.compute.amazonaws.com << 'EOF'
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install nodejs -y
cd build
npm install
# ref: https://unix.stackexchange.com/questions/523657/return-the-private-ip-of-an-ec2-instance-from-within-the-ec2-instance
screen -dmS server sudo node server.js \$(ec2metadata --local-ipv4)
EOF
