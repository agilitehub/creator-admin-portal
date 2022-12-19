import Axios from 'agilite-utils/axios'
import Enums from '../utils/enums'
import { getDeSo } from '../deso/controller'

export const getHodlers = (Username, IsDAOCoin) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let response = null
      let errMsg = null

      // TODO: Enums
      try {
        response = await Axios.post('https://desocialworld.com/api/v0/get-hodlers-for-public-key', {
          PublicKeyBase58Check: '',
          Username,
          LastPublicKeyBase58Check: '',
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
          AmountNanos: Math.round(amount * 1000000000),
          MinFeeRateNanosPerKB: 1000
        }

        await getDeSo().wallet.sendDesoRequest(request)

        resolve()
      } catch (e) {
        console.log(e)
        reject('Unknown Error Occured. Please check console')
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
          AmountNanos: Math.round(amount * 1000000000),
          MinFeeRateNanosPerKB: 1000
        }

        await getDeSo().wallet.sendDesoRequest(request)

        resolve()
      } catch (e) {
        console.log(e)
        reject('Unknown Error Occured. Please check console')
      }
    })()
  })
}
