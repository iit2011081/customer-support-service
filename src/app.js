import * as http from 'http'
import Koa from 'koa'
import Debug from 'debug'
import logger from 'koa-logger'
import config from './config'
import api from './routes'
import bodyParser from 'koa-bodyparser'
import cors from 'koa2-cors'
import Router from 'koa-router'
import redisHelper from './utils/redis'
import IO from 'koa-socket-2'
import sessionService from './services/session.service'
import messageService from './services/message.service'
import authService from './services/auth.service'
import serve from 'koa-static'
import path from 'path'

const app = new Koa();
const io = new IO();
const log = Debug('app.js:log');
const logerr = Debug('app.js:error');
const router = new Router();

const staticDirPath = path.join(__dirname, 'public');
app.use(serve(staticDirPath));

app.proxy = true;
io.attach(app);
app.context.io = io;
const socketIdUserIdMapping = {};

/**
 * Socket handlers
 */
 io.on('connection', async(socket) => {
	console.log("on connection");
	io.broadcast('connections', {
		numConnections: io.connections.size
	});

	socket.on('signUp', async(data) => {
		try {
			const user = await authService.signUp({"fullName" : data.fullName, "roleId" : data.roleId || "1hj6fin00000000"});
			socket.user = user;
			let key = "socket."+user.id,
				socketIds = [];
			let redisResponse = await redisHelper.get(key);
			if(redisResponse) {
				socketIds = JSON.parse(redisResponse);
			}
			if(socketIds.indexOf(socket.id) == -1) {
				socketIds.push(socket.id);
			}
			redisHelper.set(key, JSON.stringify(socketIds));
			socket.emit('userSet', user);
			socketIdUserIdMapping[socket.id] = user.id;
		} catch (err) {
			socket.emit('userExists', err.message);
		}
	});

	socket.on('sendMessage', async(data) => {
		if(!socket.user && data.user) {
			socket.user = data.user;
			let key = "socket."+data.user.id,
				socketIds = [];
			let redisResponse = await redisHelper.get(key);
			if(redisResponse) {
				socketIds = JSON.parse(redisResponse);
			}
			if(socketIds.indexOf(socket.id) == -1) {
				socketIds.push(socket.id);
			}
			redisHelper.set(key, JSON.stringify(socketIds));
			socketIdUserIdMapping[socket.id] = data.user.id;
		}
		if(!data.sessionId && socket.user.role == 'Customer') {
			//Create Session
			const session = await sessionService.createSession(socket.user, data);
			data.sessionId = session.id;
			socket.emit('sessionSet', session.id);
		}
		//Save and Send Message to other party 
		messageService.saveAndSendMessage(socket.user, socket, data);
	});

	socket.on('disconnect', async() => {
		//Remove socket id from redis
		if(socketIdUserIdMapping[socket.id]) {
			let key = "socket."+socketIdUserIdMapping[socket.id],
			socketIds = [];
			let redisResponse = await redisHelper.get(key);
			if(redisResponse) {
				socketIds = JSON.parse(redisResponse);
			}
			let index = socketIds.indexOf(socket.id);
			if(index > -1) {
				socketIds.splice(index, 1);
			}
			redisHelper.set(key, JSON.stringify(socketIds));
			delete socketIdUserIdMapping[socket.id];
		}
	});
});

app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		ctx.status = err.status || 400;
		let message = err.message;
		if (err.name == "UnauthorizedError") {
			message = "Login Expired";
		}
		ctx.body = {
			status: false,
			message: message,
			errorCode: err.errorCode || err.status || err.code || 400
		};
		ctx.app.emit('error', err, ctx);
	}
});

app.use(cors({
	origin: '*',
	exposeHeaders: [''],
	maxAge: 5,
	credentials: true,
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['DNT', 'User-Agent', 'X-Requested-With', 'If-Modified-Since', 'Cache-Control', 'Content-Type', 'Authorization', 'Accept', 'x-user-id'],
}));

app.use(logger());
app.use(bodyParser());

app.use(api.routes());
app.use(api.allowedMethods());

app.on('error', (err, ctx) => {
	logerr('onerr ', err);
});

log('service port %s', config.port);
app.listen = function () {
	app.server.listen.apply(app.server, arguments);
	return app.server;
}
http.createServer(app.callback());
app.listen(config.port);
// http.createServer(app.callback()).listen(config.port);