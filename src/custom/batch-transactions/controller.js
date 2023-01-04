import Axios from 'agilite-utils/axios'
import Enums from '../../utils/enums'
import { getDeSo } from '../deso/controller'

export const getHodlers = (Username, IsDAOCoin) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let response = null
      let errMsg = null

      try {
        response = await Axios.post(Enums.urls.GET_HODLERS, {
          PublicKeyBase58Check: Enums.values.EMPTY_STRING,
          Username,
          LastPublicKeyBase58Check: Enums.values.EMPTY_STRING,
          FetchHodlings: false,
          FetchAll: true,
          IsDAOCoin
        })
        resolve(response.data)
      } catch (e) {
        if (e.response?.data?.message) {
          errMsg = e.response.data.message
        } else {
          errMsg = Enums.messages.UNKNOWN_ERROR
        }

        console.error(e)
        reject(errMsg)
      }
    })()
  })
}

export const payCeatorHodler = (senderKey, receiverKey, amount) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let request = null

      try {
        request = {
          SenderPublicKeyBase58Check: senderKey,
          RecipientPublicKeyOrUsername: receiverKey,
          AmountNanos: Math.round(amount * Enums.values.NANO_VALUE),
          MinFeeRateNanosPerKB: 1000
        }

        await getDeSo().wallet.sendDesoRequest(request)

        resolve()
      } catch (e) {
        reject(e)
      }
    })()
  })
}

export const payDaoHodler = (senderKey, receiverKey, amount) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let request = null

      try {
        request = {
          SenderPublicKeyBase58Check: senderKey,
          RecipientPublicKeyOrUsername: receiverKey,
          AmountNanos: Math.round(amount * Enums.values.NANO_VALUE),
          MinFeeRateNanosPerKB: 1000
        }

        await getDeSo().wallet.sendDesoRequest(request)

        resolve()
      } catch (e) {
        reject(e)
      }
    })()
  })
}
