import { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import "./App.css";
import { loadContract } from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
    isProviderLoaded: false,
  });
  
  const [account, setAccount] = useState(null);		// account state
  const [balance, setBalance] = useState(null);		// account balance state
  const [word, setWord] = useState('');		// word state
  const [meaning, setMeaning] = useState('');		// word state
  const [reloadEffect, setReloadEffect] = useState(false);		// reload component state
  const failedToConnectContract = account && web3Api.contract;		// contract loaded or not
  
	// account changed or network changed
  const setAccountListener = async (provider) => {
    await provider.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });

    await provider.on("chainChanged", (_) => {
      window.location.reload();
    });
  };

  // reload the component
  const reload = useCallback(
    () => setReloadEffect(!reloadEffect),
    [reloadEffect]
  );

  // load provider
  useEffect(() => {
    const loadProvider = async () => {
      // with metamask we have an access to window.ethereum & to window.web3
      // metamask injects a global API into websites &
      // this API allows websites to request users, accounts, read data to blockchain, sign messages and transactions

      const provider = await detectEthereumProvider();

      if (provider) {
        const contract = await loadContract("Dictionary", provider);
        setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true,
        });
      } else {
        setWeb3Api((api) => ({ ...api, isProviderLoaded: true }));
        alert("Please install MetaMask!");
      }
    };

    loadProvider();
  }, []);

  // get connected account
  useEffect(() => {
    const getAccount = async () => {
      let accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    web3Api.web3 && getAccount();
  }, [web3Api.web3, reloadEffect]);

  // load contract balance
  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    };

    web3Api.contract && loadBalance();
  }, [web3Api, reloadEffect]);

  // request for connecting metamask
  const connectWallet = async () => {
    const { provider } = web3Api;
    await provider.request({
      method: "eth_requestAccounts",
    });
    reload();
  };

	// handle word change
	const handleChangeWord = (e) => {
		setWord(e.target.value);
	};

	// handle meaning change
	const handleChangeMeaning = (e) => {
		setMeaning(e.target.value);
	};

  // contract function for findMeaning to the contract address
  const findMeaning = useCallback(async () => {
    const { contract } = web3Api;
    const res = await contract.findMeaning(word, {
      from: account,
    });

    console.log('=====FindMeaning=====', res);
    setMeaning(res);
    reload();
  }, [word, web3Api, account, reload]);

  // contract function for saveMeaning to the contract address
  const saveMeaning = useCallback(async() => {
    const { contract } = web3Api;
    const res = await contract.saveMeaning(word, meaning, {
			from: account,
		});
		console.log('=====SaveMeaning=====', res);
    reload();
  }, [word, meaning, web3Api, account, reload]);

  // contract function for getWordCount
  const getWordCount = useCallback(async () => {
    const { contract } = web3Api;
    const res = await contract.getWordCount({
      from: account,
    });

    console.log("====WordCount======", res);
    reload();
  }, [web3Api, account, reload]);

  // contract function for getWordCount
  const getAllWords = useCallback(async () => {
    const { contract } = web3Api;
    const res = await contract.getAllWords({
      from: account,
    });

    console.log("=====AllWords====", res);
    reload();
  }, [web3Api, account, reload]);

  return (
    <>
      <div className="faucet-wraper">
        <div className="faucet">
          {web3Api.isProviderLoaded ? (
            <div className="text-center mb-2">
              <strong>Account:</strong>
              <span className="ml-2">
                {account ? (
                  account
                ) : !web3Api.provider ? (
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-1 rounded dark:bg-yellow-200 dark:text-yellow-900">
                    <span>
                      Wallet is not detected!{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://metamask.io/download/"
                      >
                        Install metamask
                      </a>
                    </span>
                  </div>
                ) : (
                  <button
                    className="bg-green-600 hover:bg-green-700 rounded text-white py-1 px-3"
                    onClick={connectWallet}
                  >
                    Connect Wallet
                  </button>
                )}
              </span>
            </div>
          ) : (
            <span>Looking for web3...</span>
          )}

          <div className="hidden balance-view mb-4 text-2xl text-center">
            Current balance: <strong>{balance}</strong> ETH
          </div>
					
          {!failedToConnectContract && (
            <span className="text-center block pb-1 text-red-400">
              <i>Connect to Ganache</i>
            </span>
          )}

          <div className="text-center flex mb-2 gap-4">
						<div className="w-32 text-right"> 
							Word:
						</div>
						<div className="">
	            <input value={word} onChange={handleChangeWord} className="border-2 border-stone-400 focus-visible:border-stone-500" />
						</div>
          </div>
          <div className="text-center flex mb-4 gap-4">
						<div className="w-32 text-right"> Meaning: </div>
						<div>
            	<textarea value={meaning} onChange={handleChangeMeaning} rows="2" cols="100" className="border-2 border-stone-400 focus-visible:border-stone-500" />
						</div>
          </div>

					<div className="text-center">
            <button
              disabled={!failedToConnectContract}
              onClick={findMeaning}
              className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded mr-2 disabled:opacity-50"
            >
              Find Meaning
            </button>
            
            <button
              disabled={!failedToConnectContract}
              onClick={saveMeaning}
              className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded mr-2 disabled:opacity-50"
            >
              Save Meaning
            </button>

            <button
              disabled={!failedToConnectContract}
              onClick={getWordCount}
              className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded mr-2 disabled:opacity-50"
            >
              Get Word Count
            </button>

            <button
              disabled={!failedToConnectContract}
              onClick={getAllWords}
              className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded mr-2 disabled:opacity-50"
            >
              Get All Words
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
