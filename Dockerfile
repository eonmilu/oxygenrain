FROM golang
LABEL maintainer="Miguel Vila <eonmilu@gmail.com>"

ENV GOPATH /opt/go:$GOPATH
ENV PATH /opt/go/bin:$PATH
ADD . /opt/go/src/local/eonmilu/oxygenrain
WORKDIR /opt/go/src/local/eonmilu/oxygenrain

RUN go get github.com/derekparker/delve/cmd/dlv
RUN go build -o main main.go

EXPOSE 8080 8443

CMD ["./main"]
