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
  const Web3ModalRef = useRef()


  /**
   * Returns a Provider or Signer object representing the Eth RPC
   * Signer - used incase a write tx needs to be made to a blockchain
   */
  const getProviderOrSigner = async (needSigner = false) => {
    //connect metamask
    const provider = await Web3ModalRef.current.connet()
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


      const tx = await whitelistContract.addAddressToWhitelist()

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
}