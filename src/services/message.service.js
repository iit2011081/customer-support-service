import models from '../models'
import constants from '../utils/constants';
import _, { filter } from 'lodash'
import errorMessages from '../utils/errorMessages';
import sessionService from './session.service';
import redisHelper from '../utils/redis';

class Message {
    async saveAndSendMessage(loginUser, socket, data) {
        try {
            let key = 'session-info-'+data.sessionId;
            let session = await redisHelper.get(key);
            if(session) {
                session = JSON.parse(session);
            } else {
                session = await models.session.findOne({
                    where : {
                        id : data.sessionId
                    }
                });
                session = {
                    customerId : session.customerId,
                    agentId : session.agentId || null,
                }
                await redisHelper.set(key, JSON.stringify(session));
            }
            let receiverId, senderName;
            if(loginUser.role == 'Customer') {
                receiverId = session.agentId;
                senderName = loginUser.fullName;
            } else {
                receiverId = session.customerId;
                senderName = loginUser.alias;
            }
            const message = await models.message.create({
                content : data.content,
                senderId : loginUser.id,
                receiverId : receiverId,
                sessionId : data.sessionId
            })
            if(receiverId) {
                sessionService.sendDataToUserUsingSocket(socket, receiverId, 'receiveMessage', {'content' : data.content, 'user' : senderName, 'sessionId' : data.sessionId, 'createdAt' : message.createdAt});
            }
        } catch (err) {
            console.log("err", err);
            throw err;
        }
    }
}
const messageService = new Message();
export default messageService;