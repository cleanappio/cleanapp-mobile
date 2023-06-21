/* eslint-disable no-alert */
/* eslint-disable handle-callback-err */
import React, {useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {theme} from '../services/Common/theme';
import {pinFileToIPFS, pinJSONToIPFS} from '../services/API/APIManager';
import {settings as s} from '../services/API/Settings';
import DocumentPicker from 'react-native-document-picker';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Ripple from './Ripple';
import TextInput from './TextInput';
import {ScrollView} from 'react-native-gesture-handler';
import {fontFamilies} from '../utils/fontFamilies';
const {createAlchemyWeb3} = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(s.alchemy.key);
const contractABI = require('../abis/contract-abi.json');

const MintNft = ({open, onClose, wallet, contractAddress}) => {
  const [file, setFile] = useState(null);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [minting, setMinting] = useState(false);

  const pickFile = async () => {
    try {
      const pickedFile = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images],
      });
      if (pickedFile && pickedFile.uri) {
        setFile(pickedFile);
      } else {
        setFile(null);
      }
    } catch (err) {}
  };

  const handleMintNft = async () => {
    setMinting(true);
    const fileUploadRes = await pinFileToIPFS(file);
    if (fileUploadRes && fileUploadRes.IpfsHash) {
      const pinataUrl = `https://gateway.pinata.cloud/ipfs/${fileUploadRes.IpfsHash}`;
      const nftMetadataReq = {
        image: pinataUrl,
        name: nftName,
        description: nftDescription,
      };
      const pinJSONRes = await pinJSONToIPFS(nftMetadataReq);
      if (pinJSONRes && pinJSONRes.IpfsHash) {
        const tokenURI = pinJSONRes.IpfsHash;
        const nonce = await web3.eth.getTransactionCount(
          wallet.publicKey,
          'latest',
        ); //get latest nonce
        const nftContract = new web3.eth.Contract(contractABI, contractAddress);
        //the transaction
        const tx = {
          from: wallet.publicKey,
          to: contractAddress,
          nonce: nonce,
          gas: 500000,
          data: nftContract.methods
            .mintNFT(wallet.publicKey, tokenURI)
            .encodeABI(),
        };

        const signPromise = web3.eth.accounts.signTransaction(
          tx,
          wallet.privateKey,
        );
        signPromise
          .then((signedTx) => {
            web3.eth.sendSignedTransaction(
              signedTx.rawTransaction,
              function (err, hash) {
                if (!err) {
                  alert('NFT Minted');
                  setFile(null);
                  setNftName('');
                  setNftDescription('');
                } else {
                  alert('Some error occured');
                }
              },
            );
          })
          .catch((err) => {
            alert('Some error occured');
          });
      } else {
        alert('Some error occured');
      }
    } else {
      alert('Some error occured');
    }
    setMinting(false);
  };

  return (
    <Modal transparent visible={open} animationType="slide">
      <View style={styles.tcCloseButtonContainer}>
        <Ripple
          disabled={minting}
          onPress={onClose}
          style={styles.tcCloseButton}>
          <AntIcon size={20} name="close" color={theme.COLORS.WHITE} />
        </Ripple>
      </View>
      <View style={styles.tcModalContainer}>
        <View style={styles.tcModalContentContainer}>
          <Text onPress={pickFile} style={styles.tcHeaderTitle}>
            Mint NFT
          </Text>

          <ScrollView>
            <Ripple
              disabled={minting}
              onPress={pickFile}
              style={styles.pickFileButton}>
              <Text style={styles.buttonText}>Pick Asset</Text>
            </Ripple>

            {file && file.uri && (
              <>
                <Image
                  borderRadius={5}
                  resizeMode="stretch"
                  style={styles.image}
                  source={{uri: file && file.uri}}
                />

                <TextInput
                  height={40}
                  value={nftName}
                  label="NFT Name"
                  placeholder="NFT Name"
                  onChangeText={(val) => setNftName(val)}
                />

                <TextInput
                  isTextArea
                  height={40}
                  label="Description"
                  value={nftDescription}
                  placeholder="Description"
                  onChangeText={(val) => setNftDescription(val)}
                />

                <Ripple
                  disabled={minting}
                  onPress={handleMintNft}
                  style={styles.pickFileButton}>
                  {!minting ? (
                    <Text style={styles.buttonText}>Mint NFT</Text>
                  ) : (
                    <View style={styles.rowCentered}>
                      <ActivityIndicator
                        size="small"
                        color={theme.COLORS.WHITE}
                      />
                      <Text style={styles.buttonText}>Minting...</Text>
                    </View>
                  )}
                </Ripple>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default MintNft;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 200,
    width: '100%',
    marginBottom: 10,
  },
  button: {
    elevation: 5,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: theme.APP_COLOR_2,
    shadowOffset: {width: 0, height: 4},
  },

  tcModalContainer: {
    flex: 1,
  },
  tcModalContentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: theme.APP_COLOR_2,
  },
  tcHeaderTitle: {
    margin: 10,
    fontSize: 16,
    lineHeight: 29,
    textAlign: 'center',
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
  },
  tcCloseButtonContainer: {
    top: 5,
    right: 5,
    zIndex: 1,
    position: 'absolute',
  },
  tcCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.APP_COLOR_1,
  },
  pickFileButton: {
    height: 40,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.APP_COLOR_1,
  },
  buttonText: {
    marginLeft: 5,
    color: theme.COLORS.WHITE,
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
