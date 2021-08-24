import SnowflakeCondon from 'snowflake-codon'

module.exports = function (sequelize, DataTypes) {
	const generator = new SnowflakeCondon();
	const user = sequelize.define('user', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		fullName: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'full_name'
		},
		alias: {
			type: DataTypes.STRING,
			allowNull: false,
			field: 'alias'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
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
		tableName: 'user',
		timestamps: true,
		paranoid: true
	});

	user.beforeValidate((user) => {
		user.id = generator.nextId();
		return user;
	});

	user.associate = function (models) {
		user.belongsTo(models.role, {
			onDelete: "CASCADE",
			as: 'role',
			foreignKey: {
				name: 'roleId',
				field: 'role_id',
				allowNull: false
			}
		});
	};

	user.prototype.toJSON = function () {
		let user = {
			id: this.id,
			fullName: this.fullName || ''
        };
		return user;
	};

	return user;
};