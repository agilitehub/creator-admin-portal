import Axios from 'agilite-utils/axios'
import Deso from 'deso-protocol'
import Config from '../config/config.json'
import DesoEnums from './enums'

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
        window.open(DesoEnums.urls.LOGIN_URL)

        window.addEventListener(DesoEnums.events.MESSAGE, async (e) => {
          if (e.data.method === DesoEnums.methods.INIT) {
            e.source.postMessage(
              { id: e.data.id, service: DesoEnums.values.IDENTITY, payload: {} },
              DesoEnums.urls.IDENTITY_URL
            )
          } else if (e.data.method === DesoEnums.values.LOGIN) {
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
        hodlerObject = await Axios.post(DesoEnums.urls.DAO_BALANCE, {
          FetchAll: true,
          FetchHodlings: true,
          IsDAOCoin: true,
          PublicKeyBase58Check: publicKey
        })

        exchangeObject = await Axios.get(DesoEnums.urls.EXCHANGE_RATE)

        if (hodlerObject.data.Hodlers.length > 0) {
          daoBalance = (
            parseInt(hodlerObject.data.Hodlers[0].BalanceNanosUint256) /
            DesoEnums.values.NANO_VALUE /
            DesoEnums.values.NANO_VALUE
          ).toFixed(0)

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
          AmountNanos: Math.round(amount * DesoEnums.values.NANO_VALUE),
          MinFeeRateNanosPerKB: 1000
        }

        response = await deso.wallet.sendDesoRequest(request)
        await Axios.post(`${Config.nodeRedUrl}${DesoEnums.routes.CREATE_PAYMENT_TRANSACTION}`, response, {
          headers: {
            type: DesoEnums.values.DESO,
            [DesoEnums.headers.RECORD_ID]: taskTransactionId,
            [DesoEnums.headers.GHOST_ID]: ghostId,
            [DesoEnums.headers.TASK_ID]: taskId
          }
        })

        resolve()
      } catch (e) {
        console.log(e)
        reject(DesoEnums.messages.UNKNOWN_ERROR)
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
          DAOCoinToTransferNanos:
            DesoEnums.values.HEX_PREFIX +
            (amount * DesoEnums.values.NANO_VALUE * DesoEnums.values.NANO_VALUE).toString(16),
          MinFeeRateNanosPerKB: 1000
        }

        response = await deso.dao.transferDAOCoin(request)
        await Axios.post(`${Config.nodeRedUrl}${DesoEnums.routes.CREATE_PAYMENT_TRANSACTION}`, response, {
          headers: {
            type: DesoEnums.values.DAO,
            [DesoEnums.headers.RECORD_ID]: taskTransactionId,
            [DesoEnums.headers.GHOST_ID]: ghostId,
            [DesoEnums.headers.TASK_ID]: taskId
          }
        })

        resolve()
      } catch (e) {
        console.log(e)
        reject(DesoEnums.messages.UNKNOWN_ERROR)
      }
    })()
  })
}

export const getDeSo = () => {
  return deso
}
