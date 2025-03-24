This repo contains all codes for the ECommerce freelance marketplace application.

### API Documentation
- [Postman API Documentation](https://documenter.getpostman.com/view/10197229/2sAYkHqKA5)

### Microservices
* The `microservices` folder contains all the backend code for the application's services.
* The services can be started either individually from the terminal or via docker compose.
* http://localhost:8025/# (mailHog)


### SocketIO Server and Event Listeners
* order notifications ----> http://localhost:4006 (order notification [event listener])
* mark messages as read ----> http://localhost:4005 (update message [event listener] , message received [ack])
* logged in users ----> http://localhost:4000 (online [event listener], loggedInUsers [ack])
* saved category --> http://localhost:4000 (category[ack])
* chat message received --> http://localhost:4005 (message received[event listener])

### RabbitMQ UserName and Password
* username -------> nicholas
* password -------> secret