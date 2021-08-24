import responseService from '../services/response.service'
import sessionService from '../services/session.service'
import errorMessages from '../utils/errorMessages';

class Session {
    async fetchUnassignedSessions(ctx) {
        await sessionService.fetchUnassignedSessions(ctx.request.user).then(user => {
			let msg = errorMessages.MSG_5;
			return responseService.sendSuccessResponse(ctx, user, msg);
		}).catch(function (err) {
			return responseService.sendErrorResponse(ctx, err);
		});
    }

	async fetchActiveSessions(ctx) {
        await sessionService.fetchActiveSessions(ctx.request.user).then(user => {
			let msg = errorMessages.MSG_5;
			return responseService.sendSuccessResponse(ctx, user, msg);
		}).catch(function (err) {
			return responseService.sendErrorResponse(ctx, err);
		});
    }

	async acceptSession(ctx) {
        await sessionService.acceptSession(ctx.request.user, ctx.io.socket, ctx.params.id).then(user => {
			let msg = errorMessages.MSG_7;
			return responseService.sendSuccessResponse(ctx, user, msg);
		}).catch(function (err) {
			return responseService.sendErrorResponse(ctx, err);
		});
    }

	async fetchSessionMessages(ctx) {
        await sessionService.fetchSessionMessages(ctx.request.user, ctx.params.id).then(user => {
			let msg = errorMessages.MSG_7;
			return responseService.sendSuccessResponse(ctx, user, msg);
		}).catch(function (err) {
			return responseService.sendErrorResponse(ctx, err);
		});
    }
}

const SessionCtrl = new Session();
export default SessionCtrl;