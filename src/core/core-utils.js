import Agilite from 'agilite'
import Axios from 'agilite-utils/axios'

import MemoryStore from '../utils/memory-store'
import Enums from '../utils/enums'
import Config from '../config/config.json'

export const signInUser = () => {
  return new Promise((resolve, reject) => {
    ;(async function () {
      const entry = MemoryStore.signInForm
      let errMsg = null
      let result = null

      try {
        // Format Header Props
        entry.email = entry.email.toLowerCase()
        entry[Enums.headers.TEAM_ID] = Config.agilite.teamId

        // Authenticate User
        result = await Axios.get(`${Config.apiUrl}${Enums.endpoints.AUTH_USER}`, { headers: { ...entry } })

        MemoryStore.agilite = new Agilite({
          apiServerUrl: Config.apiUrl,
          apiKey: result.data.apiKey,
          teamId: Config.agilite.teamId
        })

        MemoryStore.apiKey = result.data.apiKey
        MemoryStore.userProfile = result.data
        MemoryStore.signInForm = {}

        delete result.data.apiKey

        resolve()
      } catch (err) {
        console.log(err)

        if (err.response) {
          errMsg = err.response.data.errorMessage
        } else if (err.message) {
          errMsg = err.message
        } else {
          errMsg = Enums.messages.UNKNOWN_ERROR
        }

        reject(errMsg)
      }
    })()
  })
}
