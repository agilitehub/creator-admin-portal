import Axios from 'agilite-utils/axios'
import Deso from 'deso-protocol'
import Config from '../config/config.json'

const deso = new Deso()

export const desoLogin = () => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const request = 4
        const response = await deso.identity.login(request)
        resolve(response)
      } catch (e) {
        reject(e)
        console.log(e)
      }
    })()
  })
}

export const desoLoginManual = () => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        window.open('https://identity.deso.org/log-in?accessLevelRequest=4')

        window.addEventListener('message', async (e) => {
          if (e.data.method === 'initialize') {
            e.source.postMessage({ id: e.data.id, service: 'identity', payload: {} }, 'https://identity.deso.org')
          } else if (e.data.method === 'login') {
            await e.source.close()
            resolve(e.data.payload)
          }
        })
      } catch (e) {
        reject(e)
        console.log(e)
      }
    })()
  })
}

export const desoLogout = (publicKey) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let response = null

      try {
        response = await deso.identity.logout(publicKey)
        resolve(response)
      } catch (e) {
        reject(e)
        console.log(e)
      }
    })()
  })
}

export const getSingleProfile = (key) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let request = null
      let response = null

      try {
        request = {
          PublicKeyBase58Check: key
        }

        response = await deso.user.getSingleProfile(request)
        resolve(response)
      } catch (e) {
        reject(e)
        console.log(e)
      }
    })()
  })
}

export const getDaoBalance = (publicKey) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let hodlerObject = null
      let exchangeObject = null
      let daoBalance = 0

      try {
        hodlerObject = await Axios.post('https://blockproducer.deso.org/api/v0/get-hodlers-for-public-key', {
          FetchAll: true,
          FetchHodlings: true,
          IsDAOCoin: true,
          PublicKeyBase58Check: publicKey
        })

        exchangeObject = await Axios.get('https://blockproducer.deso.org/api/v0/get-exchange-rate')

        if (hodlerObject.data.Hodlers.length > 0) {
          daoBalance = (parseInt(hodlerObject.data.Hodlers[0].BalanceNanosUint256) / 1000000000 / 1000000000).toFixed(0)

          if (daoBalance < 1) daoBalance = 0
        }

        resolve({ daoBalance, desoPrice: exchangeObject.data.USDCentsPerDeSoExchangeRate / 100 })
      } catch (e) {
        reject(e)
        console.log(e)
      }
    })()
  })
}

export const payDeso = (senderKey, receiverKey, amount, taskTransactionId, ghostId, taskId) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let request = null
      let response = null

      try {
        request = {
          SenderPublicKeyBase58Check: senderKey,
          RecipientPublicKeyOrUsername: receiverKey,
          AmountNanos: Math.round(amount * 1000000000),
          MinFeeRateNanosPerKB: 1000
        }

        response = await deso.wallet.sendDesoRequest(request)
        await Axios.post(`${Config.nodeRedUrl}/api/createPaymentTransaction`, response, {
          headers: { type: 'deso', 'record-id': taskTransactionId, 'ghost-id': ghostId, 'task-id': taskId }
        })

        resolve()
      } catch (e) {
        console.log(e)
        reject('Unknown Error Occured. Please check console')
      }
    })()
  })
}

export const payDaoCoin = (senderKey, receiverKey, amount, taskTransactionId, ghostId, taskId) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let request = null
      let response = null

      try {
        request = {
          SenderPublicKeyBase58Check: senderKey,
          ProfilePublicKeyBase58CheckOrUsername: senderKey,
          ReceiverPublicKeyBase58CheckOrUsername: receiverKey,
          // Hex String
          DAOCoinToTransferNanos: '0x' + (amount * 1000000000 * 1000000000).toString(16),
          MinFeeRateNanosPerKB: 1000
        }

        response = await deso.dao.transferDAOCoin(request)
        await Axios.post(`${Config.nodeRedUrl}/api/createPaymentTransaction`, response, {
          headers: { type: 'dao', 'record-id': taskTransactionId, 'ghost-id': ghostId, 'task-id': taskId }
        })

        resolve()
      } catch (e) {
        console.log(e)
        reject('Unknown Error Occured. Please check console')
      }
    })()
  })
}

export const getDeSo = () => {
  return deso
}
