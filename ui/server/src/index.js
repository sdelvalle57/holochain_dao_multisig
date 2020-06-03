require('dotenv').config();
// const { ApolloServer } = require('apollo-server');
const { ApolloServer } = require('apollo-server-express')
const express = require('express');
const cors = require('cors')
const http = require('http');
const { connect } = require('@holochain/hc-web-client');

const typeDefs = require('./schema');
const HelpersAPI = require('./datasources/helpers');
const MultisigAPI = require('./datasources/multisig');
const OrganizationsAPI = require('./datasources/organizations');
const resolvers = require('./resolvers');

(async () => {

    const app = express();
    app.use(cors())

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
            apiKey: process.env.APOLLO_KEY,
        },
      
        subscriptions: {
            onConnect: (connectionParams, webSocket) => {
                console.log('Websocket CONNECTED');
                return {
                    hello: 'world'
                }
            },
            onDisconnect: () => {
                console.log("disc")
            }
        }
    });

    server.applyMiddleware({ app });

    const httpServer = http.createServer(app);
    server.installSubscriptionHandlers(httpServer);

    const port = process.env.PORT ? process.env.PORT : 4000;
    
    httpServer.listen( port , () => {
        console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
    })
})().catch(e => console.log(e))
