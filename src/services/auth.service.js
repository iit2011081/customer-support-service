import appHelper from '../utils/appHelper';
import errorMessages from '../utils/errorMessages';
import models from '../models';
import config from '../config'
import redisHelper from '../utils/redis'

class Auth {
    async setUserDataInRedis(userId, user, exp) {
        let userData = {
            fullName : user.fullName,
            alias : user.alias,
            id : user.id
        }
        if(user.role) {
            if(user.role.id) {
                userData.role  = user.role.name;
            }
        } else {
            const role = await models.role.findByPk(user.roleId);
            userData.role = role.name;
        }
		if(!exp) {
			exp = oauth.getAccessTokenExpiry();
		}
		redisHelper.set(userId, JSON.stringify(userData), exp);
    }

    async signUp(postData) {
        try {
            return Promise.all([
                models.user.findOne({
                    where : {
                        "fullName" : {
                            $ilike : postData.fullName
                        }
                    },
                    include : [
                        {
                            model : models.role,
                            as : 'role'
                        }
                    ]
                }),
                models.role.findOne({
                    where : {
                        id : postData.roleId
                    }
                })
            ]).then(async (responses) => {
                let user = responses[0],
                    role = responses[1];
                if (user) {
                    if(user.role.id == postData.roleId) {
                        this.setUserDataInRedis("user-"+user.id, user, config.userDetailsExpiry);
                        return { id: user.id, fullName : user.fullName, role : user.role.name, alias : user.alias};
                    } else {
                        var err = appHelper.getAppErrorObject('INVALID_ID');
                        err.message = errorMessages.MSG_10;
                        throw err;
                    }
                } else if(!role) {
                    
                } else {
                    postData.alias = postData.alias || postData.fullName;
                    user = await models.user.create(postData);
                    if (user) {
                        user.role = role;
                        this.setUserDataInRedis("user-"+user.id, user, config.userDetailsExpiry);
                        return { id: user.id, fullName : user.fullName, role : role.name, alias : user.alias};
                    } else {
                        var err = appHelper.getAppErrorObject('SOMETHING_WENT_WRONG');
                        throw err;
                    }
                }
            }, (err) => {
                throw err;
            });
        } catch (err) {
            throw err;
        }
    }
}
const authService = new Auth();
export default authService;