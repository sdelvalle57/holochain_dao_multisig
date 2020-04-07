const path = require('path')

const { 
  Orchestrator, 
  Config, 
  combine, 
  singleConductor, 
  localOnly, 
  tapeExecutor 
} = require('@holochain/tryorama')

const M_ZOME = "multisig";

process.on('unhandledRejection', error => {
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, "../dist/dna.dna.json")
const alicePath = path.join(__dirname, "../alice.keystore")
const bobPath = path.join(__dirname, "../bob.keystore")

const orchestrator = new Orchestrator({
  middleware: combine(
    tapeExecutor(require('tape')),
    localOnly
  ),
})

//HcScj5GbxXdTq69sfnz3jcA4u5f35zftsuu5Eb3dBxHjgd9byUUW6JmN3Bvzqqr


const aliceConfig = Config.gen(
  [
    {
      id: "alice_instance",
      agent: {
        id: "alice_instance",
        name: "alice", 
        public_address: 'HcScijzE9x3Qjogoz9xOK4NjxFNthmf9br9ow8tN7PUb6djyAoWu5rKuhrsq93i',
        keystore_file: alicePath,
        test_agent: true,
      },
      dna: {
        id: 'multisig-test',
        file: dnaPath,
      }
    },
  ],
  {
    network: {
      type: "sim2h",
      sim2h_url: "ws://localhost:9000"
    },
    //logger: Config.logger({ type: "error" }),
  }
)

const bobConfig = Config.gen(
  [
    {
      id: 'bob_instance',
      agent: {
        id: 'bob_instance',
        name: "bob", 
        public_address: 'HcSCjoiU46sN787haaPA8z9QJ87WF64tx4agaka44D3dx7h8k45UdS9aPTF3koa',
        keystore_file: bobPath,
        test_agent: true,
      },
      dna: {
        id: 'multisig-test',
        file: dnaPath,
      }
    }
  ],
  {
    network: {
      type: "sim2h",
      sim2h_url: "ws://localhost:9000"
    },
    //logger: Config.logger({ type: "error" }),
  }
)

/**********Functions */

const getEntry = async (user, address) => {
  const entryResult = await user.call(
    "multisig-test", 
    M_ZOME, 
    "get_entry",
    { address }
  )
  return entryResult;
}

orchestrator.registerScenario("Scenario1: Start app", async (s, t) => {

  const { alice, bob } = await s.players(
    { alice: aliceConfig, bob: bobConfig },
    true
  );

  console.log("alice instance add", alice.instance("alice_instance").agentAddress)
  t.ok( alice.instance("alice_instance").agentAddress)
  console.log("bob instance add", bob.instance("bob_instance").agentAddress)
  t.ok( alice.instance("alice_instance").agentAddress)

  const start = await alice.call(
    "alice_instance", 
    M_ZOME, 
    "start", 
    { }
  )
  t.ok(start.Ok)
  await s.consistency();

  const start2 = await alice.call(
    "alice_instance",
    M_ZOME,
    "start",
    { }
  )
  t.ok(start2.Ok)
  await s.consistency();

  const multisig = await alice.call(
    "alice_instance",
    M_ZOME,
    "get_multisig",
    { }
  )
  t.ok(multisig.Ok)

  console.log("the_multisigs", multisig)

})



orchestrator.run()
