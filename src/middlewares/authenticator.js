import models from '../models/index'
import redisHelper from '../utils/redis'

class Authenticator {
	async authenticateUser(ctx, next) {
		let headers = ctx.headers;
		if(headers && headers['x-user-id']) {
			let user = await redisHelper.get('user-'+headers['x-user-id']);
			if(!user) {
				user = await models.user.findOne({
					where : {
						id : headers['x-user-id']
					},
					include : [
						{
							model : models.role,
							as : 'role'
						}
					]
				});
				user = user.dataValues;
				user.role = user.role.name;
			} else {
				user = JSON.parse(user);
			}
			ctx.request.user = user;
			if(ctx.request.user) {
				await next();
			} else {
				ctx.throw(401, 'Unauthorized Access');
			}
		} else {
			ctx.throw(401, 'Unauthorized Access');
		}
	}

	async authenticateSocket(headers) {
		if(!headers && !headers['x-user-id']) {
			throw new Error('Unauthorized Access');
		}
		userData = await redisHelper.get('user-'+headers['x-user-id']);
		if (!userData) {
			user = await models.user.findOne({
				where : {
					id : headers['x-user-id']
				},
				include : [
					{
						model : models.role,
						as : 'role'
					}
				]
			});
			if(user) {
				user = user.dataValues;
				user.role = user.role.name;
				return user;
			} else {
				ctx.throw(403, 'Unauthorized Access');
			}
		} else {
			return JSON.parse(userData);
		}
	}
}
var authenticator = new Authenticator();
export default authenticator;