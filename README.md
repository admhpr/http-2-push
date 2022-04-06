### HTTP/2 PUSH

HTTP/2 does not work without HTTPS because all the browsers enforce that it must be a secure connection. Technically the spec doesn't require it but our stuff won't work otherwise so we need to quickly generate a self-signed certificate to use for our app.

### Create a self signed certificate

Ensure openssl is installed:

`openssl version`

#### Generate key pair

`openssl req -new -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem`

Enter on all questions (answers don't matter)

#### Generate cert

`openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt`

