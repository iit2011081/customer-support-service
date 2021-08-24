import Router from 'koa-router';
import authCtrl from '../controllers/auth.ctrl.js'
import roleCtrl from '../controllers/role.ctrl.js';
import sessionCtrl from '../controllers/session.ctrl'
import validate from 'koa2-validation'
import schema from '../utils/validation'
import authenticator from '../middlewares/authenticator'

const router = new Router({
	prefix: '/api/v1'
});


//App APIs
/***************************Auth routes******************************/
router.post('/web/auth/signup', validate(schema.signUp), authCtrl.signUp);

/***************************Role routes******************************/
router.get('/web/roles', roleCtrl.fetchRoles);
router.post('/web/role', validate(schema.roleCreation), roleCtrl.createRole);

/***************************Session routes******************************/
router.get('/web/sessions/unassigned', authenticator.authenticateUser, sessionCtrl.fetchUnassignedSessions);
router.get('/web/sessions/active', authenticator.authenticateUser, sessionCtrl.fetchActiveSessions);
router.put('/web/session/:id/accept', authenticator.authenticateUser, sessionCtrl.acceptSession);
router.get('/web/session/:id/messages', authenticator.authenticateUser, sessionCtrl.fetchSessionMessages);

export default router;



