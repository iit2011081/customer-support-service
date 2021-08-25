**Customer Support Messaging Web App**<br>

The main objective behind this application is to allow a team of agents to respond to incoming messages from (potentially many) customers in a streamlined fashion.
I have assumed that we will not store all the messages for life time and considering the small scale I have choosen SQL db.<br>
Tech Stack - NodeJs(Koa2), Postgres, Redis, Websockets <br><br>

![er_diagram](https://user-images.githubusercontent.com/9371846/130850946-af3372b3-c118-4999-9adf-64873361b494.png)


**Steps to run this application** <br>
1 - Create a postgres db with any name<br>
2 - Run sql script<br>
3 - Install Redis<br>
4 - mv .env.example to .env and update the content<br>
5 - npm install<br>
6 - npm run dev or npm run local<br>
