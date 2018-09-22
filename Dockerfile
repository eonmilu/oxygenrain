FROM golang
LABEL maintainer="Miguel Vila <eonmilu@gmail.com>"

ENV GOPATH=/go
ADD . $GOPATH/src/github.com/eonmilu/oxygenrain
WORKDIR $GOPATH/src/github.com/eonmilu/oxygenrain
EXPOSE 8080 8443 8903

COPY goyt/ /go/src/github.com/eonmilu/
RUN go get github.com/derekparker/delve/cmd/dlv github.com/gorilla/mux

RUN go build

ENTRYPOINT ["/go/bin/dlv", "debug", "-l 127.0.0.1:8903", "--log=true", "--headless=true", "--", "server"]
