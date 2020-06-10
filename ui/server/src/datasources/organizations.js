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

    async newOrganization(name, description, owner, multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "new")({
            name,
            description, 
            owner,
            multisig_address
        })
        return this.reducer(JSON.parse(response))
    }

    async newMultisig(title, description, organization_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "create_multisig")({
            title,
            description,
            organization_address
        })
        return this.reducer(JSON.parse(response))
    }

    async getOrganization(entry_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "get")({
            entry_address
        })
        console.log(response)
        return this.reducer(JSON.parse(response))
    }

    async getOrganizations(multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "get_all")({
            multisig_address
        })
        return this.reducer(JSON.parse(response))
    }

    async getMyOrganizations() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "get_my_organizations")({})
        return this.reducer(JSON.parse(response))
    }
}

module.exports = OrganizationAPI;