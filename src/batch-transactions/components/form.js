import React, { memo, useState } from 'react'
import { Row, Col, Card, Select, Button, Popconfirm, Input, message, Table } from 'antd'
import theme from '../../agilite-react/resources/theme'
import { getHodlers, payCeatorHodler, payDaoHodler } from '../controller'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { getDaoBalance, getSingleProfile } from '../../deso/controller'
import Enums from '../../agilite-react/resources/enums'

const _BatchTransactionsForm = () => {
  const dispatch = useDispatch()
  const desoState = useSelector((state) => state.agiliteReact.deso)
  const [transactionType, setTransactionType] = useState('')
  const [hodlers, setHodlers] = useState([])
  const [amount, setAmount] = useState(0)
  const [coinTotal, setCoinTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleTransactionTypeChange = async (value) => {
    let tmpHodlers = []
    let finalHodlers = []
    let tmpCoinTotal = 0
    let isDAOCoin = null
    let noOfCoins = 0

    // Make Requests
    try {
      if (value === transactionType) return

      handleReset(value)
      if (!value) return

      setLoading(true)
      isDAOCoin = value === 'dao'
      tmpHodlers = await getHodlers(desoState.profile.Profile.Username, isDAOCoin)

      if (tmpHodlers.Hodlers.length > 0) {
        // Determine Coin Total and valid Hodlers
        tmpHodlers.Hodlers.map((entry) => {
          // Ignore entry if is current logged in user
          if (entry.ProfileEntryResponse.Username !== desoState.profile.Profile.Username) {
            // Determine Number of Coins
            if (isDAOCoin) {
              noOfCoins = entry.BalanceNanosUint256
              noOfCoins = hexToInt(noOfCoins)
              noOfCoins = noOfCoins / 1000000000 / 1000000000
            } else {
              noOfCoins = entry.BalanceNanos
              noOfCoins = noOfCoins / 1000000000
            }

            // decimalCount = noOfCoins.countDecimals()
            entry.noOfCoins = noOfCoins
            tmpCoinTotal += noOfCoins
            finalHodlers.push(entry)
          }

          return null
        })

        updateHolderAmounts(finalHodlers, tmpCoinTotal)
      }

      setHodlers(finalHodlers)
      setCoinTotal(tmpCoinTotal)
    } catch (e) {
      message.error(e)
    }

    setLoading(false)
  }

  const updateHolderAmounts = (tmpHodlers, tmpCoinTotal, tmpAmount) => {
    let estimatedPayment = 0

    // Determine % Ownership and Estimated Payment
    tmpHodlers.map((entry) => {
      // Determine % Ownership
      entry.percentOwnership = calculatePercOwnership(entry.noOfCoins, tmpCoinTotal)

      // Determine Estimated Payment
      if (tmpAmount > 0) estimatedPayment = calculateEstimatePayment(entry.noOfCoins, tmpCoinTotal, tmpAmount)
      // decimalCount = estimatedPayment.countDecimals()
      entry.estimatedPayment = estimatedPayment

      return null
    })
  }

  const generateActions = () => {
    return (
      <Row justify='space-between'>
        <Col span={2}>Batch Transactions</Col>
        <Col>
          <Select
            disabled={!desoState.loggedIn || isExecuting}
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
            onConfirm={() => handleReset()}
          >
            <Button style={{ color: theme.white, backgroundColor: theme.twitterBootstrap.danger, marginLeft: 20 }}>
              Reset
            </Button>
          </Popconfirm>
        </Col>
      </Row>
    )
  }

  const handleReset = (tmpTransactionType = '') => {
    setTransactionType(tmpTransactionType)
    setHodlers([])
    setAmount(0)
    setCoinTotal(0)
  }

  const handleAmount = (e) => {
    const amount = parseFloat(e.target.value)
    const desoBalance = desoState.profile.Profile.DESOBalanceNanos / 1000000000

    if (desoBalance > amount) {
      setAmount(amount)
      updateHolderAmounts(hodlers, coinTotal, amount)
    } else {
      message.error('Amount cannot be higher than $DESO Balance')
    }
  }

  const hexToInt = (hex) => {
    return parseInt(hex, 16)
  }

  const calculatePercOwnership = (value, tmpCoinTotal) => {
    return (value / tmpCoinTotal) * 100
  }

  const calculateEstimatePayment = (value, tmpCoinTotal, tmpAmount) => {
    return tmpAmount * (calculatePercOwnership(value, tmpCoinTotal) / 100)
  }

  const handleExecute = async () => {
    let tmpHodlers = hodlers
    let daoData = null
    let profile = null

    setLoading(true)
    setIsExecuting(true)

    for (const hodler of hodlers) {
      try {
        if (transactionType === 'dao') {
          await payDaoHodler(
            desoState.profile.Profile.PublicKeyBase58Check,
            hodler.HODLerPublicKeyBase58Check,
            hodler.estimatedPayment
          )
        } else {
          await payCeatorHodler(
            desoState.profile.Profile.PublicKeyBase58Check,
            hodler.HODLerPublicKeyBase58Check,
            hodler.estimatedPayment
          )
        }

        hodler.paid = true
      } catch (e) {
        hodler.paid = false
      }
    }

    setHodlers(tmpHodlers)

    profile = await getSingleProfile(desoState.profile.Profile.PublicKeyBase58Check)
    daoData = await getDaoBalance(desoState.profile.Profile.PublicKeyBase58Check)
    dispatch({ type: Enums.reducers.SET_PROFILE_DESO, payload: profile })

    dispatch({
      type: Enums.reducers.SET_DESO_DATA,
      payload: { desoPrice: daoData.desoPrice, daoBalance: daoData.daoBalance }
    })

    setLoading(false)
    setIsExecuting(false)
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
                disabled={transactionType && !isExecuting ? false : true}
                placeholder='Amount'
                type='number'
                value={amount}
                onChange={handleAmount}
              />
            </Col>
          </Row>
          {transactionType ? (
            <Row justify='center' style={{ marginTop: 10 }}>
              <Col>
                <Popconfirm
                  title='Are you sure you want to execute payments to the below Coin Holders?'
                  okText='Yes'
                  cancelText='No'
                  onConfirm={handleExecute}
                  disabled={isExecuting}
                >
                  <Button
                    disabled={isExecuting}
                    style={{ color: theme.white, backgroundColor: theme.twitterBootstrap.success, marginLeft: 20 }}
                  >
                    Execute Payment
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
                    dataIndex: 'noOfCoins',
                    key: 'noOfCoins'
                  },
                  {
                    title: '% Ownership',
                    dataIndex: 'percentOwnership',
                    key: 'percentOwnership'
                  },
                  {
                    title: 'Eastimated Payment ($DESO)',
                    dataIndex: 'estimatedPayment',
                    key: 'estimatedPayment',
                    render: (value) => {
                      return <span style={{ color: theme.twitterBootstrap.primary }}>{value}</span>
                    }
                  },
                  {
                    title: 'Status',
                    dataIndex: 'paid',
                    key: 'status',
                    render: (value) => {
                      console.log('Status', value)
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
