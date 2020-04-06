const path = require('path')

const { 
  Orchestrator, 
  Config, 
  combine, 
  singleConductor, 
  localOnly, 
  tapeExecutor 
} = require('@holochain/tryorama')

const DNA = "multisig_test";
const M_ZOME = "multisig";

process.on('unhandledRejection', error => {
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, "../dist/dna.dna.json")

const orchestrator = new Orchestrator({
  middleware: combine(
    tapeExecutor(require('tape')),
    localOnly,
  ),
})

const dna = Config.dna(dnaPath, 'multisig_test')
const conductorConfig = Config.gen(
  { multisig_test: dna },
  {
    network: {
      type: "sim2h",
      sim2h_url: "ws://localhost:9000"
    },
    logger: Config.logger({type: "error"}),
  },
  );

/**********Functions */

const getEntry = async (user, address) => {
  const entryResult = await user.call(
    DNA, 
    M_ZOME, 
    "get_entry",
    { address }
  )
  return entryResult;
}


// orchestrator.registerScenario("Scenario0: Get Valid Memebers", async (s, t) => {

//   const  {alice, bob } = await s.players(
//     { alice: conductorConfig, bob: conductorConfig }, 
//     true
//   );

//   const members = await alice.call(
//     "multisig_test", 
//     "multisig", 
//     "get_members", 
//     { }
//   )

//   console.log("dna_address", members);

//   //t.equal(1, members.Ok.length);
//   await s.consistency();

// })

orchestrator.registerScenario("Scenario1: Start app", async (s, t) => {

  const  {alice, bob } = await s.players(
    { alice: conductorConfig, bob: conductorConfig }, 
    true
  );

  const start = await alice.call(
    DNA, 
    M_ZOME, 
    "start", 
    { }
  )
  t.ok(start.Ok)
  await s.consistency();

  const multisig = await alice.call(
    DNA,
    M_ZOME,
    "get_multisig",
    { }
  )
  console.log("get_ms", multisig)
  await s.consistency();

})

// orchestrator.registerScenario("Scenario1: Add Memeber", async (s, t) => {

//   const  {alice, bob } = await s.players(
//     { alice: conductorConfig, bob: conductorConfig }, 
//     true
//   );

//   const members = await alice.call(
//     DNA, 
//     M_ZOME, 
//     "add_member", 
//     { 
//       name: "Bob", 
//       description: "Add Bob", 
//       address: bob.instance(DNA).agentAddress
//     }
//   )
//   t.ok(members.Ok);
//   await s.consistency();

//   const transaction = await alice.call(
//     DNA,
//     M_ZOME,
//     "get_transaction",
//     {
//       address: members.Ok
//     }
//   );
//   console.log("the_tx", JSON.stringify(transaction))
//   await s.consistency();

// })

// orchestrator.registerScenario("Scenario1: Create Multisig", async (s, t) => {

//   const  {alice, bob } = await s.players(
//     { alice: conductorConfig, bob: conductorConfig }, 
//     true
//   );

//   const multisig_addr = await createMultisig(alice, "My Multisig", "This creates a new multisig")
//   t.ok(multisig_addr);
//   await s.consistency();
  
//   const multisig_result = await getEntry(alice, multisig_addr.Ok);

//   const multisig = JSON.parse(multisig_result.Ok.App[1]);
//   t.deepEqual(multisig, {
//     title: "My Multisig",
//     description: "This creates a new multisig",
//     signatories: [alice.instance("multisig_test").agentAddress],
//     required: 1,
//     creator: alice.instance("multisig_test").agentAddress
//   })
//   await s.consistency();

// })

// orchestrator.registerScenario("Scenario2: Create and fetch Multisig", async (s, t) => {

//   const  {alice, bob } = await s.players(
//     { alice: conductorConfig, bob: conductorConfig }, 
//     true
//   );

//   const multisig_addr = await createMultisig(alice, "My Multisig", "This creates a new multisig")
//   t.ok(multisig_addr);
//   await s.consistency();
  
//   const multisig_result = await getEntry(alice, multisig_addr.Ok);

//   const multisig = JSON.parse(multisig_result.Ok.App[1]);
//   t.deepEqual(multisig, {
//     title: "My Multisig",
//     description: "This creates a new multisig",
//     signatories: [alice.instance("multisig_test").agentAddress],
//     required: 1,
//     creator: alice.instance("multisig_test").agentAddress,
//   })
//   await s.consistency();

//   const fetchedMultisig = await alice.call(
//     "multisig_test", 
//     "create_multisig", 
//     "get",
//     { address: multisig_addr.Ok }
//   )
//   console.log("fetchedMultisig", fetchedMultisig);
//   t.deepEqual(multisig, fetchedMultisig.Ok);
//   await s.consistency();

// })

// orchestrator.registerScenario("Scenario3: Create many", async (s, t) => {

//   const  {alice, bob } = await s.players(
//     { alice: conductorConfig, bob: conductorConfig }, 
//     true
//   );

//   const multisig_addr1 = await createMultisig(alice, "My Multisig1", "This creates a new multisig")
//   t.ok(multisig_addr1);
//   await s.consistency();

//   const multisig_addr2 = await createMultisig(alice, "My Multisig2", "This creates a new multisig")
//   t.ok(multisig_addr2);
//   await s.consistency();
  

//   const myMultisigs = await alice.call(
//     "multisig_test", 
//     "create_multisig", 
//     "get_my_multisigs",
//     {}
//   )
//   t.equal(2, myMultisigs.Ok.length);
//   await s.consistency();

// })

// orchestrator.registerScenario("Scenario4: Create two with the same data", async (s, t) => {

//   const  {alice, bob } = await s.players(
//     { alice: conductorConfig, bob: conductorConfig }, 
//     true
//   );

//   const multisig_addr1 = await createMultisig(alice, "My Multisig1", "This creates a new multisig")
//   t.ok(multisig_addr1);
//   await s.consistency();

//   const multisig_addr2 = await createMultisig(alice, "My Multisig1", "This creates a new multisig")
//   console.log("multisig_addr2", multisig_addr2);
//   t.ok(multisig_addr2.Err);
//   await s.consistency();
  

//   const myMultisigs = await alice.call(
//     "multisig_test", 
//     "create_multisig", 
//     "get_my_multisigs",
//     {}
//   )
//   console.log("fetchedMultisigs", myMultisigs);
//   t.equal(1, myMultisigs.Ok.length);
//   await s.consistency();

// })

orchestrator.run()
