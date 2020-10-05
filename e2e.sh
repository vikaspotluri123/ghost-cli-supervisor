#! /bin/bash

ghost -v

# Make the version of the package discoverable
sudo npm link -g

ghost install --local -d ghost-test --process supervisor --no-prompt
