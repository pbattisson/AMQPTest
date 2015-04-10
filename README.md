#AMQP Test

This app is a basic Node.js system showing how to use JackRabbit and AMQP. To use the app you need rabbitmq installed, installation instructions for Mac OSX are available [here.](https://www.rabbitmq.com/install-standalone-mac.html)

##Usage
Firstly open a terminal window and launch rabbit mq using
```bash
rabbitmq-server
```
To use the app run the main server
```bash
node index.js
```
Then open a new terminal window and launch a service by navigating to the services directory and launching the info service using
```bash
node services/info.js
```
You can launch multiple instances of the service by repeating this and they will all subscribe to the same queue.

To then make a request to the server to call a service open a final terminal session calling
```bash
curl 0.0.0.0:8080/info
```
If you make this request multiple times then you can see the different services responding to the requests.
