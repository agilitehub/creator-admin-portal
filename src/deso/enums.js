const DesoEnums = {
  urls: {
    LOGIN_URL: 'https://identity.deso.org/log-in?accessLevelRequest=4',
    IDENTITY_URL: 'https://identity.deso.org',
    DAO_BALANCE: 'https://blockproducer.deso.org/api/v0/get-hodlers-for-public-key',
    EXCHANGE_RATE: 'https://blockproducer.deso.org/api/v0/get-exchange-rate',
    GET_HODLERS: 'https://desocialworld.com/api/v0/get-hodlers-for-public-key'
  },
  routes: {
    CREATE_PAYMENT_TRANSACTION: '/api/createPaymentTransaction'
  },
  headers: {
    RECORD_ID: 'record-id',
    GHOST_ID: 'ghost-id',
    TASK_ID: 'task-id'
  },
  values: {
    IDENTITY: 'identity',
    LOGIN: 'login',
    NANO_VALUE: 1000000000,
    DESO: 'deso',
    DAO: 'dao',
    CREATOR: 'creator',
    HEX_PREFIX: '0x',
    YES: 'yes',
    NO: 'no',
    EMPTY_STRING: ''
  },
  events: {
    MESSAGE: 'message'
  },
  methods: {
    INIT: 'initialize'
  },
  messages: {
    UNKNOWN_ERROR: 'Unknown Error Occured. Please check console'
  },
  tabKeys: {
    DESO_LOGIN: 'deso-login',
    BATCH_TRANSACTIONS: 'batch_transactions'
  }
}

export default DesoEnums
