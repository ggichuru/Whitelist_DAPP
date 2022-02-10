import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState, usestate } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants"

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhiteList, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0)

  // Web3 modal (for connecting metamask) reference, which persists as long as the page is open
  const web3ModalRef = useRef()


  /**
   * Returns a Provider or Signer object representing the Eth RPC
   * Signer - used incase a write tx needs to be made to a blockchain
   */
  const getProviderOrSigner = async (needSigner = false) => {
    //connect metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 4) {
      window.alert("Change network to rinkeby")
      throw new Error("Change network to rinkeby")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }

    return web3Provider
  }


  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )


      const tx = await whitelistContract.addAddressToWhitelist({ gasLimit: 3000000 })

      setLoading(true)

      await tx.wait()
      setLoading(false)

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true)
    } catch (error) {
      console.error(error)
    }
  }

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();

      setNumberOfWhitelisted(_numberOfWhitelisted)
    } catch (error) {
      console.error(error)

    }
  }


  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const address = await signer.getAddress()

      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address)

      setJoinedWhitelist(_joinedWhitelist)
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)

      checkIfAddressInWhitelist()
      getNumberOfWhitelisted()
    } catch (error) {
      console.error(error)
    }
  }

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhiteList) {
        return (
          <div className={styles.description}>
            Thanks for joining the whitelist
          </div>
        )
      } else if (loading) {
        return <button className={styles.button}>loading ... </button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the whitelist
          </button>
        )
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      )
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinbey",
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet()
    }
  }, [walletConnected])

  return (
    <div>
      <Head>
        <title>Whitelist Dapp (GG)</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs</h1>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by GG
      </footer>
    </div>
  )
}