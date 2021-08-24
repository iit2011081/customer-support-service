import SnowflakeCondon from 'snowflake-codon'

module.exports = function (sequelize, DataTypes) {
	const generator = new SnowflakeCondon();
	const message = sequelize.define('message', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		content: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'content'
		},
		attachment:{
			type:DataTypes.ARRAY(DataTypes.STRING),
			allowNull:false,
			field:'attachment',
			defaultValue: []
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
		tableName: 'message',
		timestamps: true,
		paranoid: true
	});

	message.associate = function (models) {
		message.belongsTo(models.user, {
			onDelete: "CASCADE",
			as: 'sender',
			foreignKey: {
				name: 'senderId',
				field: 'sender_id',
				allowNull: false
			}
		});
		message.belongsTo(models.user, {
			onDelete: "CASCADE",
			as: 'receiver',
			foreignKey: {
				name: 'receiverId',
				field: 'receiver_id',
				allowNull: true
			}
		});
		message.belongsTo(models.session, {
			onDelete: "CASCADE",
			as: 'session',
			foreignKey: {
				name: 'sessionId',
				field: 'session_id',
				allowNull: false
			}
		});
	};

	message.beforeValidate((com) => {
		com.id = generator.nextId();
		return com;
	});

	// message.hook('afterCreate', function(message, options) {
	// 	//For every new message update the session's updatedAt field
	// 	console.log("after create", message.dataValues);
	// 	if(message.dataValues.sessionId) {
	// 		//Update Session
	// 		// sessionService.updateSession(message.dataValues.sessionId, {})
	// 	}
	// })

	message.prototype.toJSON = function () {
		let message = {
			id: this.id,
			content: this.content,
			createdAt: this.createdAt,
            updatedAt : this.updatedAt
		};
		if (this.sender) {
			message.sender = {
				id : this.sender.id,
				fullName : this.sender.fullName,
			}
		}
		if (this.receiver) {
			message.receiver = {
				id :  this.receiver.id,
				fullName :  this.receiver.fullName,
			}
		} else {
			message.receiver = {}
		}
		return message;
	};
	return message;
};