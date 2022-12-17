const Enums = {
  appTitles: {
    MEMBERS: 'Members',
    TASK_PROFILES: 'Task Profiles',
    TASK_TRANSACTIONS: 'Task Transactions',
    PAYMENT_TRANSACTIONS: 'Payment Transactions',
    BATCH_TRANSACTIONS: 'Batch Transactions'
  },
  fieldNames: {
    EMAIL: 'email',
    PASSWORD: 'password'
  },
  values: {
    ENV_PRODUCTION: 'production',
    ENV_DEVELOPMENT: 'development',
    ROOT_TAG: 'root',
    STRING_EMPTY: '',
    INT_ZERO: 0
  },
  reqMethods: {
    POST: 'post',
    PUT: 'put',
    GET: 'get',
    DELETE: 'delete'
  },
  endpoints: {
    AUTH_USER: '/auth/user'
  },
  roles: {
    ADMIN: 'Admin'
  },
  headers: {
    API_KEY: 'api-key',
    CONTENT_TYPE: 'Content-Type',
    TEAM_ID: 'team-id',
    RECORD_ID: 'record-id',
    FILE_ID: 'file-id',
    REPORT_TYPE: 'report-type',
    BPM_PROCESS_KEY: 'bpm-process-key',
    BPM_RECORD_ID: 'bpm-record-id',
    PROCESS_ID: 'process-id',
    EXPORT_TYPE: 'export-type'
  },
  messages: {
    UNKNOWN_ERROR: 'An unknown error occurred. The Agilit-e service may not be available'
  },
  tabKeys: {
    TASK_PROFILES: 'task_profiles',
    TASK_TRANSACTIONS: 'task_transactions',
    MEMBERS: 'members',
    PAYMENT_TRANSACTIONS: 'payment_transactions',
    BATCH_TRANSACTIONS: 'batch_transactions',
    HOME: 'home',
    APPS: 'apps'
  },
  titles: {
    MEMBERS: 'Members',
    TASK_PROFILES: 'Task Profiles',
    TASK_TRANSACTIONS: 'Task Transactions',
    HOME: 'Home',
    APPLICATIONS: 'Applications',
    PORTAL_MENU: 'Portal Menu'
  },
  profileKeys: {},
  routeKeys: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    UPDATE_MANY: 'update_many',
    DELETE: 'delete',
    DELETE_MANY: 'delete_many',
    BULK_WRITE: 'bulk_write'
  }
}

export default Enums
