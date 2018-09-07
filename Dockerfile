FROM debian
LABEL maintainer="Miguel Vila <eonmilu@gmail.com>"

WORKDIR /app

ADD oxygenrain /app
ADD psql.cfg /psql.cfg


ENTRYPOINT ["./oxygenrain"]
