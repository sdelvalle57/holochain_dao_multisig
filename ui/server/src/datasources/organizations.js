require('dotenv').config();
const { RESTDataSource } = require('apollo-datasource-rest');
const {Error} = require('../global-reducers');

class OrganizationAPI extends RESTDataSource {

    constructor({callZome}) {
        super();
        this.callZome = callZome;
    }

    reducer(response) {
        if('Ok' in response) {
            return response.Ok 
        } else if(response.Err) {
            return Error(response.Err)
        }
    }

    async newOrganization(name, description, owner) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "new")({
            name,
            description, 
            owner
        })
        return this.reducer(JSON.parse(response))
    }

    async newMultisig() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "create_multisig")({})
        return this.reducer(JSON.parse(response))
    }

    async getOrganization(address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "get")({
            address
        })
        return this.reducer(JSON.parse(response))
    }

    async getOrganizations() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "get_all")({})
        return this.reducer(JSON.parse(response))
    }

    async getMyOrganizations() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "get_my_organizations")({})
        return this.reducer(JSON.parse(response))
    }
}

module.exports = OrganizationAPI;