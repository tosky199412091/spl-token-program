import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Spltokenprogram } from "../target/types/spltokenprogram";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { createAccount } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";



describe("spltokenprogram", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);
  const program = anchor.workspace.Spltokenprogram as Program<Spltokenprogram>;


  // const mintToken = anchor.web3.Keypair.generate()
  const mintToken = Keypair.fromSecretKey(Uint8Array.from(require('./7oysHEbos49JX4dvBA6bQ6Ydji8DjoLUmCwXKYVqPdzs.json')));

  const associateTokenProgram = new anchor.web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")

  const tokenAccount = anchor.utils.token.associatedAddress({ mint: mintToken.publicKey, owner: provider.publicKey })

  const ta = anchor.web3.PublicKey.findProgramAddressSync(
    [provider.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintToken.publicKey.toBuffer()],
    associateTokenProgram
  )[0]

  let tokenAccountKeyPair = anchor.web3.Keypair.generate()



  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Create token!", async () => {

    console.log(mintToken.publicKey.toBase58())
    console.log(tokenAccount.toBase58())

    try {
      const tx = await program.methods.createToken(6, new anchor.BN(10 ** 9))
        .accounts({
          mintToken: mintToken.publicKey,
          tokenAccount: tokenAccount,
          associateTokenProgram,
        })
        .signers([mintToken])
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      console.log(error)
    }
  });

  it("Token transfer", async () => {

    let reciever = anchor.web3.Keypair.generate()

    const signature = await provider.connection.requestAirdrop(reciever.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    await provider.connection.confirmTransaction(signature)

    let recieverTokenAccountKeypair = anchor.web3.Keypair.generate()
    await createAccount(provider.connection, reciever, mintToken.publicKey, reciever.publicKey, recieverTokenAccountKeypair);

    try {
      let send_amount = 10 * 10 ** 6;
      const tx = await program.methods.transerToken(new anchor.BN(send_amount))
        .accounts({
          mintToken: mintToken.publicKey,
          fromAccount: tokenAccount,
          toAccount: recieverTokenAccountKeypair.publicKey,
          associateTokenProgram
        })
        .signers([])
        .rpc()

      console.log("Your transaction signature", tx);
    } catch (error) {
      console.log(error)
    }
  })
});
