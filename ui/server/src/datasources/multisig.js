require('dotenv').config();
const { RESTDataSource } = require('apollo-datasource-rest');
const {createMultisig, get, getAll} = require('../config');
const {Error} = require('../global-reducers');

class MyAddressAPI extends RESTDataSource {

    constructor({callZome}) {
        super();
        this.callZome = callZome;
    }

    entryReducer(response) {
        if(response.Ok) {
            return {
                entry: response.Ok,
              }
        } else if(response.Err) {
            return Error(response.Err)
        } else return null
    }

    reducer(response) {
        if(response.Ok) {
            return response.Ok
        } else if(response.Err) {
            return Error(response.Err)
        } else return null
        
    }

    async start() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "start")({})
        return this.entryReducer(JSON.parse(response))
    }

    async addMember(name, description, address, multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "add_member")({
            name, 
            description, 
            address,
            multisig_address
        })
        return this.entryReducer(JSON.parse(response))
    }

    async changeRequirement(new_requirement, description, multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "change_requirement")({
            new_requirement, 
            description,
            multisig_address
        })
        return this.entryReducer(JSON.parse(response))
    }

    async signTransaction(entry_address, multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "sign_transaction")({
            entry_address,
            multisig_address
        })
        return this.entryReducer(JSON.parse(response))
    }

    async executeTransaction(entry_address, multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "execute_transaction")({
            entry_address,
            multisig_address
        })
        console.log(response)
        return this.entryReducer(JSON.parse(response))
    }

    /**Getters */
    async getMembers(multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "get_members")({
            multisig_address
        })
        console.log(response)
        return this.reducer(JSON.parse(response))
    }

    async getMultisigAddress() {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "get_multisig_address")({})
        return this.entryReducer(JSON.parse(response))
    }

    async getMultisig(multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "get_multisig")({
            multisig_address
        })
        return this.reducer(JSON.parse(response))
    }

    async getTransaction(entry_address, multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "get_transaction")({
            entry_address,
            multisig_address
        })
        console.log(response)
        return this.reducer(JSON.parse(response))
    }

    async getTransactionList(multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "get_transaction_list")({
            multisig_address
        })
        return this.reducer(JSON.parse(response))
    }

    async getTransactionMemberList(multisig_address) {
        const response = await this.callZome(process.env.INSTANCE_NAME, process.env.ZOME_MULTISIG, "get_transaction_member_list")({
            multisig_address
        })
        return this.reducer(JSON.parse(response))
    }
   
}

module.exports = MyAddressAPI;