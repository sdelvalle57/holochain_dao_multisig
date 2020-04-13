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

const charlieConfig = Config.gen(
  [
    {
      id: 'charlie_instance',
      agent: {
        id: 'charlie_instance',
        name: "charlie", 
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

/*
console.log("alice instance add", alice.instance("alice_instance").agentAddress)
  t.ok( alice.instance("alice_instance").agentAddress)
  console.log("bob instance add", bob.instance("bob_instance").agentAddress)
  t.ok( alice.instance("alice_instance").agentAddress)

*/

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

// orchestrator.registerScenario("Scenario1: Start app", async (s, t) => {

//   const { alice, bob } = await s.players(
//     { alice: aliceConfig, bob: bobConfig },
//     true
//   );

//   //created multisig for the first time
//   const start = await alice.call(
//     "alice_instance", 
//     M_ZOME, 
//     "start", 
//     { }
//   )
//   t.ok(start.Ok)
//   console.log("start_msig", start);
//   await s.consistency();

//   //gets multisigs addresses, should always be length = 1
//   const multisigAddress = await alice.call(
//     "alice_instance",
//     M_ZOME,
//     "get_multisig_address",
//     { }
//   )
//   console.log("address_msig", multisigAddress);
//   t.ok(multisigAddress.Ok)
//   await s.consistency();

//   //tries to start multisig again, should fail
//   const start2 = await alice.call(
//     "alice_instance",
//     M_ZOME,
//     "start",
//     { }
//   )
//   t.ok(start2.Err)
//   console.log("start_msig2", start2);
//   await s.consistency();

//   //gets multisig
//   const multisig = await alice.call(
//     "alice_instance",
//     M_ZOME,
//     "get_multisig",
//     { }
//   )
//   t.ok(multisig.Ok)
//   console.log("the_multisig", JSON.stringify(multisig))
//   await s.consistency();

//   //gets members, should be 2 members
//   const members = await alice.call(
//     "alice_instance",
//     M_ZOME,
//     "get_members",
//     { } 
//   )
//   t.ok(members.Ok)
//   console.log("the_members", members)
//   t.true(members.Ok.length === 2);

// })

orchestrator.registerScenario("Scenario1: add member transaction", async (s, t) => {

  const { alice, bob, charlie } = await s.players(
    { alice: aliceConfig, bob: bobConfig, charlie: charlieConfig },
    true
  );

  //create multisig
  const start = await alice.call("alice_instance", M_ZOME, "start", { })
  t.ok(start.Ok)
  await s.consistency();

  //add member transaction
  const add_bob_member = await alice.call("alice_instance", M_ZOME, "add_member", { 
    name: "Bob",
    description: "Add bob as member",
    address: bob.instance("bob_instance").agentAddress
  })
  t.ok(add_bob_member.Ok)
  await s.consistency();

  //get transaction list
  const tx_list = await alice.call("alice_instance", M_ZOME, "get_transaction_list", { });
  t.ok(tx_list.Ok)
  await s.consistency();

  //get user tx list
  const tx_list_member = await alice.call("alice_instance", M_ZOME, "get_member_transaction_list", { });
  t.ok(tx_list_member.Ok)
  await s.consistency();

  //get user tx address list
  const tx_address_list = await alice.call("alice_instance", M_ZOME, "get_transaction_member_address_list", { })
  t.ok(tx_address_list.Ok)
  await s.consistency();

  //gets verified transaction
  const transaction = await alice.call("alice_instance", M_ZOME, "get_transaction", {
    entry_address: tx_address_list.Ok[0]
  })
  t.ok(transaction.Ok);
  await s.consistency();

  //tries to get verified transaction, wont pass if if is not member
  const transaction_by_no_member = await bob.call("bob_instance", M_ZOME, "get_transaction", {
    entry_address: tx_address_list.Ok[0]
  })
  //"Multisig has not been started or user is not Member"
  t.ok(transaction_by_no_member.Err );
  await s.consistency();

  //tries to get verified transaction, is member, will pass
  let transaction_by_member = await charlie.call("charlie_instance", M_ZOME, "get_transaction", {
    entry_address: tx_address_list.Ok[0]
  })
  t.ok(transaction_by_member.Ok);
  await s.consistency();

  const sign_tx_by_member = await charlie.call("charlie_instance", M_ZOME, "sign_transaction", {
    entry_address: tx_address_list.Ok[0]
  })
  t.ok(sign_tx_by_member.Ok);
  await s.consistency();

  transaction_by_member = await charlie.call("charlie_instance", M_ZOME, "get_transaction", {
    entry_address: tx_address_list.Ok[0]
  })
  t.ok(transaction_by_member.Ok);
  console.log("transaction_get_by_charlie", JSON.stringify(transaction_by_member))
  await s.consistency();

})

orchestrator.run()


//charlie_address HcScJTf9ffN4t483u988j33hqoa8k63s5Pu9QEnbR5Bwuu573zKjYoMhMhs7s6z
//bob_address HcScj5GbxXdTq69sfnz3jcA4u5f35zftsuu5Eb3dBxHjgd9byUUW6JmN3Bvzqqr
//alice_address HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3u