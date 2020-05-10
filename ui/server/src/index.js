require('dotenv').config();
// const { ApolloServer } = require('apollo-server');
const { ApolloServer, graphiqlExpress } = require('apollo-server-express')
const express = require('express');
const typeDefs = require('./schema');
const HelpersAPI = require('./datasources/helpers');
const MultisigAPI = require('./datasources/multisig');
const { connect } = require('@holochain/hc-web-client');
const resolvers = require('./resolvers');


(async () => {

    const app = express();

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
        }),
        engine: {
            apiKey: process.env.ENGINE_API_KEY,
        }
    });

    server.applyMiddleware({ app });

    const port = process.env.PORT ? process.env.PORT : 4000;
    
    app.listen({ port }, () =>
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
    )
})().catch(e => console.log(e))
