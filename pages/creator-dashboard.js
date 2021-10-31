import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        console.log(meta);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );

    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoaded(true);
  }

  return (
    <div className='flex justify-center'>
      <div className='px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pag-4 pt-4'>
          {nfts.map((nft, i) => (
            <div key={i} className='border shadow rounded-xl overflow-hidden'>
              <img
                src={nft.image}
                alt=' '
                style={{ minHeight: 100, margin: 'auto' }}
              />
              <div className='p-4 bg-black'>
                <p className='text-2xl mb-4 font-bold text-white'>
                  Price - {nft.price} Matic
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='px-4'>
        {Boolean(sold.length) && (
          <div>
            <h2 className='text-2xl py-2'>Items sold</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
              {sold.map((nft, i) => (
                <div
                  key={i}
                  className='border shadow rounded-xl overflow-hidden'
                >
                  <img
                    src={nft.image}
                    alt=' '
                    style={{ minHeight: 100, margin: 'auto' }}
                  />
                  <div className='p-4 bg-black'>
                    <p className='text-2xl mb-4 font-bold text-white'>
                      Price - {nft.price} Matic
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
