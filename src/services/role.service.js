import models from '../models'

class Role {
    async createRole(data) {
        try {
            let role = await models.role.findOne({
                where : {
                    name : data.name 
                }
            })
            if(!role) {
                role = await models.role.create({ name : data.name })
            }
            return {
                id : role.id
            }
        } catch (err) {
            throw err;
        }
    }

    async fetchRoles() {
        try {
            let roles = await models.role.findAll();
            return roles;
        } catch (err) {
            throw err;
        }
    }
}
const roleService = new Role();
export default roleService;