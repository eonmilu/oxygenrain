FROM debian
LABEL maintainer="Miguel Vila <eonmilu@gmail.com>"

WORKDIR /app

EXPOSE 8080 8443

ADD oxygenrain /app
ADD public /public
ADD cfg /cfg

ENTRYPOINT ["./oxygenrain"]
