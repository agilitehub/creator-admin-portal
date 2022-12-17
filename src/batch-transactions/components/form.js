import React, { memo, useState } from 'react'
import { Row, Col, Card, Select, Button, Popconfirm, Input, message, Table } from 'antd'
import theme from '../../agilite-react/resources/theme'
import { getHodlers, payCeatorHodler, payDaoHodler } from '../controller'
import { useSelector } from 'react-redux'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const _BatchTransactionsForm = () => {
  const desoState = useSelector((state) => state.agiliteReact.deso)
  const [transactionType, setTransactionType] = useState('')
  const [amount, setAmount] = useState(0)
  const [hodlers, setHodlers] = useState([])
  const [loading, setLoading] = useState(false)

  const handleTransactionTypeChange = async (value) => {
    let tmpHodlers = []
    let isDAOCoin = null

    setTransactionType(value)
    setLoading(true)

    // Make Requests
    try {
      isDAOCoin = value === 'dao'
      tmpHodlers = await getHodlers(desoState.profile.Profile.Username, isDAOCoin)

      if (tmpHodlers.Hodlers.length > 0) {
        let deleteIndex = null

        tmpHodlers.Hodlers.map((entry, index) => {
          if (entry.ProfileEntryResponse.Username === desoState.profile.Profile.Username) {
            deleteIndex = index
          }
          return null
        })

        tmpHodlers.Hodlers.splice(deleteIndex, 1)
      }

      setHodlers(tmpHodlers.Hodlers)
    } catch (e) {
      message.error(e)
    }

    setLoading(false)
  }

  const generateActions = () => {
    return (
      <Row justify='space-between'>
        <Col span={2}>Batch Transactions</Col>
        <Col>
          <Select
            disabled={!desoState.loggedIn}
            onChange={(value) => handleTransactionTypeChange(value)}
            value={transactionType}
            style={{ width: 300 }}
          >
            <Select.Option value=''>- Select Transaction Type -</Select.Option>
            <Select.Option value='creator'>Pay Creator Coin Holders</Select.Option>
            <Select.Option value='dao'>Pay DAO Coin Holders</Select.Option>
          </Select>
          <Popconfirm
            title='Are you sure you want to reset this Batch Transaction?'
            okText='Yes'
            cancelText='No'
            onConfirm={handleReset}
          >
            <Button style={{ color: theme.white, backgroundColor: theme.twitterBootstrap.danger, marginLeft: 20 }}>
              Reset
            </Button>
          </Popconfirm>
        </Col>
      </Row>
    )
  }

  const handleReset = () => {
    setTransactionType('')
    setHodlers([])
    setAmount(0)
  }

  const hexToInt = (hex) => {
    return parseInt(hex, 16)
  }

  const calculatePercOwnership = (value) => {
    let total = 0

    hodlers.map((entry) => {
      if (transactionType === 'dao') {
        total = total + hexToInt(entry.BalanceNanosUint256) / 1000000000 / 1000000000
      } else {
        total = total + entry.BalanceNanos / 1000000000
      }

      return null
    })

    return (value / total) * 100
  }

  const calculateEstimatePayment = (value) => {
    return amount * (calculatePercOwnership(value) / 100)
  }

  const handleExecute = () => {
    let tmpHodlers = hodlers
    let amount = null

    hodlers.map(async (hodler, index) => {
      if (transactionType === 'dao') {
        amount = calculateEstimatePayment(hexToInt(hodler.BalanceNanosUint256) / 1000000000 / 1000000000)
        await payDaoHodler(desoState.profile.Profile.PublicKeyBase58Check, hodler.HODLerPublicKeyBase58Check, amount)
      } else {
        amount = calculateEstimatePayment(hodler.BalanceNanos / 1000000000)
        await payCeatorHodler(desoState.profile.Profile.PublicKeyBase58Check, hodler.HODLerPublicKeyBase58Check, amount)
      }

      tmpHodlers[index].paid = true
      setHodlers(tmpHodlers)
    })
  }

  // eslint-disable-next-line
  Number.prototype.countDecimals = function () {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0
    return this.toString().split('.')[1].length || 0
  }

  return (
    <Row justify='center'>
      <Col span={16}>
        <Card type='inner' title={generateActions()}>
          <Row justify='center'>
            <Col span={4}>
              <center>
                <span style={{ fontSize: 15 }}>
                  <b>Amount To Pay</b>
                </span>
              </center>
              <Input
                addonBefore='$DESO'
                disabled={transactionType ? false : true}
                placeholder='Amount'
                type='number'
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                }}
              />
            </Col>
          </Row>
          {transactionType ? (
            <Row justify='center' style={{ marginTop: 10 }}>
              <Col>
                <Popconfirm
                  title='Are you sure you want to execute this Batch Transaction?'
                  okText='Yes'
                  cancelText='No'
                  onConfirm={handleExecute}
                >
                  <Button
                    style={{ color: theme.white, backgroundColor: theme.twitterBootstrap.success, marginLeft: 20 }}
                  >
                    Execute
                  </Button>
                </Popconfirm>
              </Col>
            </Row>
          ) : null}
          <Row style={{ marginTop: 20 }}>
            <Col span={24}>
              <Table
                dataSource={hodlers}
                loading={loading}
                columns={[
                  { title: 'Username', dataIndex: ['ProfileEntryResponse', 'Username'], key: 'username' },
                  {
                    title: 'No of Coins',
                    dataIndex: transactionType === 'dao' ? 'BalanceNanosUint256' : 'BalanceNanos',
                    key: 'balance',
                    render: (value) => {
                      let returnValue = value
                      let decimalCount = 0

                      if (transactionType === 'dao') {
                        returnValue = hexToInt(value)
                        returnValue = returnValue / 1000000000 / 1000000000
                      } else {
                        returnValue = returnValue / 1000000000
                      }

                      decimalCount = returnValue.countDecimals()
                      return returnValue.toFixed(decimalCount)
                    }
                  },
                  {
                    title: '% Ownership',
                    dataIndex: transactionType === 'dao' ? 'BalanceNanosUint256' : 'BalanceNanos',
                    key: 'username',
                    render: (value) => {
                      let returnValue = value

                      if (transactionType === 'dao') {
                        returnValue = hexToInt(value)
                        returnValue = returnValue / 1000000000 / 1000000000
                      } else {
                        returnValue = returnValue / 1000000000
                      }

                      return calculatePercOwnership(returnValue).toFixed(2)
                    }
                  },
                  {
                    title: 'Eastimated Payment ($DESO)',
                    dataIndex: transactionType === 'dao' ? 'BalanceNanosUint256' : 'BalanceNanos',
                    key: 'estimatedPayment',
                    render: (value) => {
                      let returnValue = value
                      let decimalCount = 0

                      if (transactionType === 'dao') {
                        returnValue = hexToInt(value)
                        returnValue = returnValue / 1000000000 / 1000000000
                      } else {
                        returnValue = returnValue / 1000000000
                      }

                      returnValue = calculateEstimatePayment(returnValue)
                      decimalCount = returnValue.countDecimals()

                      return (
                        <span style={{ color: theme.twitterBootstrap.primary }}>
                          {returnValue.toFixed(decimalCount)}
                        </span>
                      )
                    }
                  },
                  {
                    title: 'Status',
                    dataIndex: 'paid',
                    key: 'status',
                    render: (value) => {
                      if (value === true) {
                        return <CheckCircleOutlined style={{ fontSize: 20, color: theme.twitterBootstrap.success }} />
                      } else if (value === false) {
                        return <CloseCircleOutlined style={{ fontSize: 20, color: theme.twitterBootstrap.danger }} />
                      }
                    }
                  }
                ]}
                pagination={false}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  )
}

const BatchTransactionsForm = memo(_BatchTransactionsForm)

export default BatchTransactionsForm
