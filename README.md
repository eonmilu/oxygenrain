# oxygenrain [![Build status](https://travis-ci.org/eonmilu/oxygenrain.svg?branch=master)](https://travis-ci.org/eonmilu/oxygenrain/)

Backend and frontend of the oxygenrain.com server.

## Running

Run a Postgres Docker container, then run `docker run -it --rm -p 8080:8080 -p 8443:8443 oxygenrain`

## Compilation

Run `go build` for a permanent binary.
Then run `docker build -t YourImageName .`
Now read the Running section.
