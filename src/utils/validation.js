import Joi from 'joi'

const schema = {
	signUp: {
		body: {
			fullName: Joi.string().min(2).required().trim(),
			roleId : Joi.string().required()
		}
	},
	roleCreation: {
		body: {
			name: Joi.string().required(),
		}
	},
};

export default schema;