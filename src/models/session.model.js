import SnowflakeCondon from 'snowflake-codon'
import constants from '../utils/constants';

module.exports = function (sequelize, DataTypes) {
	const generator = new SnowflakeCondon();
	const session = sequelize.define('session', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'status'
		},
		priority: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'priority',
            defaultValue : constants.SESSION_PRIORITY_LOW
		},
		rating: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'rating'
		},
		feedback: {
			type: DataTypes.STRING,
			allowNull: true,
			field: 'feedback'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: 'updated_at'
		},
		deletedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'deleted_at'
		}
	}, {
		tableName: 'session',
		timestamps: true,
		paranoid: true
	});

	session.associate = function (models) {
		session.belongsTo(models.user, {
			onDelete: "CASCADE",
			as: 'customer',
			foreignKey: {
				name: 'customerId',
				field: 'customer_id',
				allowNull: false
			}
		});
		session.belongsTo(models.user, {
			onDelete: "CASCADE",
			as: 'agent',
			foreignKey: {
				name: 'agentId',
				field: 'agent_id',
				allowNull: true
			}
		});
		session.hasMany(models.message, {
			onDelete: "RESTRICT",
			as: 'messages',
			foreignKey: {
				name: 'sessionId',
				field: 'session_id',
				allowNull: false
			}
		});
	};

	session.beforeValidate((com) => {
		com.id = generator.nextId();
		return com;
	});

	session.prototype.toJSON = function () {
		let session = {
			id: this.id,
			status: this.status,
            priority : this.priority,
			feedback : this.feedback || '',
			createdAt: this.createdAt,
            updatedAt : this.updatedAt
		};
		if (this.customer) {
			session.customer = {
				id : this.customer.id,
				fullName : this.customer.fullName,
			}
		}
		if (this.agent) {
			session.agent = {
				id :  this.agent.id,
				fullName :  this.agent.fullName,
			}
		}
		if(this.messages && this.messages.length) {
			session.message = this.messages[0]['content'];
		} else {
			session.message = ''
		}
		return session;
	};
	return session;
};