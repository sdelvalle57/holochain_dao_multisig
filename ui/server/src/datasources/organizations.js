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

    async new() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_ORGANIZATIONS, "new")({})
        return this.reducer(JSON.parse(response))
    }

    
}

module.exports = OrganizationAPI;