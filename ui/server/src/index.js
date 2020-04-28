require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const HelpersAPI = require('./datasources/helpers');
const MultisigAPI = require('./datasources/multisig');
const OrganizationsAPI = require('./datasources/organizations');
const { connect } = require('@holochain/hc-web-client');
const resolvers = require('./resolvers');


(async () => {
    const AGENT_PORT = process.env.AGENT_PORT ? process.env.AGENT_PORT  : 8888
    const { callZome } = await connect({ url: `ws://localhost:${AGENT_PORT}` });
    const connection = (instance, zome, fnName) => async params => {
        const result = await callZome(instance, zome, fnName)(params);
        return result;
    };

    const server = new ApolloServer({ 
        typeDefs,
        resolvers,
        dataSources: () => ({
            helpersAPI: new HelpersAPI({callZome: connection}),
            multisigAPI: new MultisigAPI({callZome: connection}),
            organizationsAPI: new OrganizationsAPI({callZome: connection})
        }),
        engine: {
            apiKey: process.env.ENGINE_API_KEY,
        }
    });

    const port = process.env.PORT ? process.env.PORT : 4000;
    
    server.listen({port}).then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
      });
})().catch(e => console.log(e))
