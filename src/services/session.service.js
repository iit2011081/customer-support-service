import models from '../models'
import constants from '../utils/constants';
import _ from 'lodash'
import errorMessages from '../utils/errorMessages';
import moment from 'moment';
import redisHelper from '../utils/redis'
import appHelper from '../utils/appHelper'

class Session {
    async createSession(loginUser, data) {
        try {
            let status = constants.SESSION_STATUS_OPEN;
            let session = await models.session.findOne({
                where : {
                    customerId : loginUser.id,
                    status : constants.SESSION_STATUS_OPEN,
                    agentId : null,
                    createdAt : {$between: [moment().subtract(1, "minutes").toDate(), moment().toDate()]}
                    
                },
                order: [
                    ['createdAt', 'DESC']
                ],
            });
            if(!session) {
                session = await models.session.create({
                    customerId : loginUser.id,
                    status : status,
                    priority : data.priority || constants.SESSION_PRIORITY_LOW,
                });
            }
            return {
                id : session.id
            }
        } catch (err) {
            console.log("err", err);
            throw err;
        }
    }

    async findSessions(extraFilters) {
        try {
            let ticketFindCond = {},
                sortCond = [];
            for (var key in extraFilters) {
                let filterValue = extraFilters[key];
                switch (key) {
                    case 'agentId':
                        ticketFindCond['agentId'] = filterValue;
                        break;

                    case 'status':
                        ticketFindCond['status'] = filterValue;
                        break;
                    
                    case 'sortBy':
                        if(Array.isArray(filterValue)) {
                            let sortOrder = [];
                            if(extraFilters['sortOrder']) {
                                if(Array.isArray(extraFilters['sortOrder'])) {
                                    sortOrder = extraFilters['sortOrder'];
                                } else {
                                    sortOrder.push(extraFilters['sortOrder']);
                                }
                            } else {
                                sortOrder.push('DESC');
                            }
                            filterValue.forEach((value, index) => {
                                const sort = [];
                                sort.push(value);
                                sort.push(sortOrder[index] || sortOrder[0]);
                                sortCond.push(sort);
                            });
                        } else {
                            const sort = [filterValue];
                            if(extraFilters['sortOrder']) {
                                sort.push(extraFilters['sortOrder'].toUpperCase());
                            } else {
                                sort.push('DESC');
                            }
                            sortCond.push(sort);
                        }
                        
                }
            }
            const findObject = {
                where: ticketFindCond,
                include: [
                    {
                        model : models.user,
                        as : 'agent'
                    },
                    {
                        model : models.user,
                        as : 'customer'
                    },
                    {
                        model: models.message,
                        as: 'messages',
                        order: [
                            ["createdAt", "DESC"]
                        ],
                        limit: 1
                    }
                ],
                order: sortCond,
            }
            return models.session.findAll(findObject);
        } catch (err) {
            throw err;
        }
    }

    async fetchUnassignedSessions(loginUser) {
        try {
            const filters = {};
            filters.status = constants.SESSION_STATUS_OPEN;
            filters.sortBy = ['priority', 'createdAt'],
            filters.sortOrder = ['DESC', 'ASC']
            return this.findSessions(filters);
        } catch (err) {
            throw err;
        }
    }

    async fetchActiveSessions(loginUser) {
        try {
            const filters = {};
            filters.agentId = loginUser.id;
            filters.status = [constants.SESSION_STATUS_ASSIGNED, constants.SESSION_STATUS_REASSIGNED];
            filters.sortBy = ['updatedAt'],
            filters.sortOrder = ['DESC']
            return this.findSessions(filters);
        } catch (err) {
            throw err;
        }
    }

    async acceptSession(loginUser, socket, sessionId) {
        try {
            let session = await models.session.findOne({
                where : {
                    id : sessionId,
                    status : constants.SESSION_STATUS_OPEN
                },
            })
            if(!session) {
                var err = appHelper.getAppErrorObject('INVALID_ID');
                err.message = errorMessages.MSG_6;
                throw err;
            }
            let dataToUpdate = {
                status : constants.SESSION_STATUS_ASSIGNED,
                agentId : loginUser.id
            }
            models.session.update(dataToUpdate, {
                where : {
                    id : sessionId
                }
            })
            //Send msg to user that I'm your agent 
            this.sendDataToUserUsingSocket(socket, session.customerId, 'receiveMessage', {'content' : `Hey!! this is ${loginUser.alias}, I'm here to help you`, 'user' : loginUser.alias});
            return {
                id : sessionId
            }
        } catch (err) {
            throw err;
        }
    }

    async sendDataToUserUsingSocket(socket, userId, key, data) {
        let socketIds = await redisHelper.get("socket."+userId);
        if(socketIds) {
            socketIds = JSON.parse(socketIds);
            if(socketIds.length) {
                for(const socketId of socketIds) {
                    socket.to(socketId).emit(key, data);
                }
            }
        }
    }

    // async sendDataToUserUsingSocket(socket, userId, key, data) {
    //     let socketId = await redisHelper.get("socket."+userId);
    //     if(socketId) {
    //         socket.to(socketId).emit(key, data);
    //     }
    // }

    async fetchSessionMessages(loginUser, sessionId) {
        try {
            let messages = await models.message.findAll({
                where : {
                    sessionId : sessionId
                },
                include : [
                    {
                        model: models.user,
                        as : 'sender'
                    },
                    {
                        model: models.user,
                        as : 'receiver'
                    }
                ],
                order : [
                    ['createdAt' , 'ASC']
                ]
            })
            return messages
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}
const sessionService = new Session();
export default sessionService;