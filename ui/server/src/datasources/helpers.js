require('dotenv').config();
const { RESTDataSource } = require('apollo-datasource-rest');
const {getMyAddress, isMember, dnaAddress, getMembers} = require('../config');
const {Error} = require('../global-reducers');

class MyAddressAPI extends RESTDataSource {

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

    async getMyAddress() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, getMyAddress)({})
        return this.reducer(JSON.parse(response))
    }

    async isHardcodedMember() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "check_is_member")({})
        return this.reducer(JSON.parse(response))
    }

    async getHardcodedMembers() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "get_hardcoded_members")({})
        return this.reducer(JSON.parse(response))
    }

    async dnaAddress() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, dnaAddress)({})
        return this.reducer(JSON.parse(response))
    }

    async members() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, getMembers)({})
        return this.reducer(JSON.parse(response))
    }
}

module.exports = MyAddressAPI;