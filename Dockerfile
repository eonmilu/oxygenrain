FROM golang
LABEL maintainer="Miguel Vila <eonmilu@gmail.com>"

ENV GOPATH /opt/go:$GOPATH
ENV PATH /opt/go/bin:$PATH
ADD . /opt/go/src/local/eonmilu/oxygenrain
WORKDIR /opt/go/src/local/eonmilu/oxygenrain

RUN go get github.com/derekparker/delve/cmd/dlv
RUN go get github.com/eonmilu/goyt
RUN go get github.com/gorilla/mux

RUN go build

CMD ["./oxygenrain"]
