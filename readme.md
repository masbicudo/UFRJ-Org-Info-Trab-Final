# Intro

Este é o meu trabalho final da disciplina de Organização da Informação da UFRJ.

# Uploading to AWS

## Creating an EC2 instance

After creating an AWS account, go to `Services`, then `EC2`.

Click the button `Launch instance`.

Select one image from the `Quick start` group
(it's the default group).

Be careful when searching for images, since results
can show paid instances from AWS Marketplace,
resulting in costs both with software and the instance itself.

Choose `Ubuntu Server 18.04 LTS (HVM), SSD Volume Type`, for example.

Choose `t2.micro` (free tier eligible).
Free tier is available in the 1st year of your AWS account.

Click the button `Review and Launch`, then `Launch`.

Now you will be asked for a key pair to connect via ssh.
Create one if you don't already have, and download the key pair.

## Installing the key

This is optional. It's meant to associate the key with the host, so that you don't have to indicate the key file
every time you want to connect to the instance.

First copy the `.pem` file you selected or created before to `~/.ssh/`.
In Windows `~` is equivalente to `%USERPROFILE%`.

Now in the `~/.ssh` folder, create a `config` file and add:

    Host ec2-0-0-0-0.us-east-2.compute.amazonaws.com
        IdentityFile ~/.ssh/key-file.pem

See [OpenSSH Config File Examples - nixCraft](https://www.cyberciti.biz/faq/create-ssh-config-file-on-linux-unix/) for more.

## Connecting for the first time

A strange message will appear if this is the first time
you connect to this instance, about the authenticity of the
server. Just type `yes`.

See [SSH: The authenticity of host <host> can't be established - StackOverflow](https://superuser.com/questions/421074/ssh-the-authenticity-of-host-host-cant-be-established) for more.

## Copying file via scp

Build the project and then copy the build folder to the instance:

    scp -r build ubuntu@ec2-0-0-0-0.us-east-2.compute.amazonaws.com:./build

## Connecting via ssh

At the command line, connect via ssh:

    ssh ubuntu@ec2-0-0-0-0.us-east-2.compute.amazonaws.com

## Running the server

After connecting via ssh, install nodejs (ref: https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/)

    curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
    sudo apt-get install nodejs

Then run the server, if you copied everything to the `build` folder already:

    cd build
    npm install
    sudo node server.js $(ec2metadata --local-ipv4)

## Keep process running after closing ssh connection

[Keep running a python program even after logging-off the ssh session [duplicate] - askubuntu](https://askubuntu.com/questions/921494/keep-running-a-python-program-even-after-logging-off-the-ssh-session)

### screen

The screen command can be used to keep a process running
in the server when the user closes the ssh connection.

ref: https://superuser.com/questions/454907/how-to-execute-a-command-in-screen-and-detach
ref: https://dev.to/bobbyiliev/how-to-keep-a-process-running-even-after-closing-ssh-connection-3cek

Create a new screen

    screen -S SOME_NAME_HERE

Detach from session:

    ctrl+a ctrl+d

Restore a previously created screen

    screen -R SOME_NAME_HERE

Lists the available screens

    screen -ls

Running nodejs server using `screen` in a single line:

    screen -dmS server sudo node server.js $(ec2metadata --local-ipv4)

# References

[How to keep a program running after closing SSH client - StackOverflow](https://askubuntu.com/questions/8653/how-to-keep-processes-running-after-ending-ssh-session)
