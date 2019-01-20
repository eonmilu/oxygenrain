FROM golang
LABEL maintainer="Miguel Vila <eonmilu@gmail.com>"

ENV GOPATH=/go
ADD . $GOPATH/src/github.com/eonmilu/xmi.lu
WORKDIR $GOPATH/src/github.com/eonmilu/xmi.lu
EXPOSE 8080 8443 8903

RUN mv goyt/ /go/src/github.com/eonmilu/goyt/
RUN go get github.com/derekparker/delve/cmd/dlv github.com/gorilla/mux github.com/lib/pq github.com/dgrijalva/jwt-go

RUN go build

ENTRYPOINT ["/go/bin/dlv", "debug", ".", "--headless", "--api-version=2", "--log", "--listen=0.0.0.0:8903"]