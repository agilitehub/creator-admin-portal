import { format } from 'agilite-utils/date-fns'

const getTask = (tasks, text, prop) => {
  let tmpTask = null

  tmpTask = tasks.find((entry) => entry._id === text)

  if (tmpTask) {
    return tmpTask[prop]
  } else {
    return 'Task Not Found'
  }
}

const templates = {
  dataModel: {},
  dataTemplate: () => {},
  columnTemplate: (tasks) => {
    return [
      {
        title: 'Transaction Date',
        dataIndex: 'TransactionDate',
        key: 'transactionDate',
        width: '10%',
        render: (text) => {
          if (text) {
            return format(new Date(text), 'yyyy-mm-dd HH:mm:ss')
          } else {
            return ''
          }
        }
      },
      {
        title: 'Task Category',
        dataIndex: 'taskId',
        key: 'taskCategory',
        width: '15%',
        render: (text) => {
          return getTask(tasks, text, 'category')
        }
      },
      {
        title: 'Task Name',
        dataIndex: 'taskId',
        key: 'taskName',
        width: '15%',
        render: (text) => {
          return getTask(tasks, text, 'taskName')
        }
      },
      {
        title: 'Type',
        dataIndex: 'TransactionType',
        key: 'transactionType',
        width: '5%',
        render: (text) => text.toUpperCase()
      },
      {
        title: 'Payment Amount',
        dataIndex: 'SpendAmountNanos',
        key: 'SpendAmountNanos',
        width: '5%',
        render: (text, record) => {
          if (record.TransactionType === 'deso') {
            return (text / 1000000000).toFixed(3) + ' ($' + getTask(tasks, record.taskId, 'reward') + ')'
          } else {
            return (parseInt(record.Transaction.TxnMeta.DAOCoinToTransferNanos, 16) / 1000000000 / 1000000000).toFixed(
              2
            )
          }
        }
      }
    ]
  }
}

export default templates
