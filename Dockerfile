FROM alpine
LABEL maintainer="Miguel Vila <eonmilu@gmail.com>"

WORKDIR /app

ADD oxygenrain /app


ENTRYPOINT ["./oxygenrain"]
