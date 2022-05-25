import '../styles/globals.css';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import '@fontsource/space-grotesk';

import { AccountContext } from '../context/AccountContext';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const theme = extendTheme({
  fonts: {
    heading: 'Space Grotesk',
    body: 'Space Grotesk',
  }
});


function MyApp({ Component, pageProps }) {
  const [currentAccount, setCurrentAccount] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  async function loadProvider ()  {
    let provider;
    if (
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined'
    ) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } else {
      if (process.env.NEXT_ENVIRONMENT === 'local') {
        provider = new ethers.providers.JsonRpcProvider();
      } else {
        provider = new ethers.providers.JsonRpcProvider(
          'https://polygon-mumbai.infura.io/v3/500553bcf26f4de1880333dfcce56107'
        );
      }
    }
    setCurrentProvider(provider);
    const accounts = await provider.listAccounts();
    setCurrentAccount(accounts[0]);
  };
  useEffect(() => {
    loadProvider();
  },[]);
  async function connect() {
    if (
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined'
    ) {
      try {
        const accounts = await currentProvider.send('eth_requestAccounts');
        setCurrentAccount(accounts[0]);
      } catch (err) {
        console.log(err);
      }
    } else {
      alert('Please Install Metamask');
    }
  }
  async function disconnect() {
    if (currentAccount) {
      setCurrentAccount(null);
    }
  }

  return (
    <>
      <AccountContext.Provider
        value={{
          currentAccount,
          connect,
          disconnect,
          currentProvider,
        }}
      >
        <ChakraProvider theme={theme}>
          <NavBar />
          <Component {...pageProps} />
          <Footer />
        </ChakraProvider>
      </AccountContext.Provider>
    </>
  );
}

export default MyApp;
