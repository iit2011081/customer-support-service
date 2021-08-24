import responseService from '../services/response.service'
import authService from '../services/auth.service'
import errorMessages from '../utils/errorMessages';

class Auth {
	async signUp(ctx) {
		await authService.signUp(ctx.request.body).then(user => {
			let msg = errorMessages.MSG_9;
			return responseService.sendSuccessResponse(ctx, user, msg);
		}).catch(function (err) {
			return responseService.sendErrorResponse(ctx, err);
		});
	}
}

const authCtrl = new Auth();
export default authCtrl;