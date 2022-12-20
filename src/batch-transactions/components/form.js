import React, { memo, useState } from 'react'
import { Row, Col, Card, Select, Button, Popconfirm, Input, message, Table, Popover } from 'antd'
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
            // Set Defaults
            entry.status = ''

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
      <Row>
        <Col xs={24} md={6}>
          <center>
            <h3>Batch Payments</h3>
          </center>
        </Col>
        <Col xs={24} md={12}>
          <center>
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
          </center>
        </Col>
        <Col xs={24} md={6}>
          <center>
            <Popconfirm
              title='Are you sure you want to reset this Batch Transaction?'
              okText='Yes'
              cancelText='No'
              onConfirm={() => handleReset()}
            >
              <Button style={{ color: theme.white, backgroundColor: theme.twitterBootstrap.danger }}>Reset</Button>
            </Popconfirm>
          </center>
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
    let tmpHodlers = null
    let daoData = null
    let profile = null
    let functionToCall = null

    setLoading(true)
    setIsExecuting(true)

    // Reset Statuses
    tmpHodlers = hodlers.map((tmpHodler) => {
      return {
        ...tmpHodler,
        status: ''
      }
    })

    setHodlers(tmpHodlers)

    if (transactionType === 'dao') {
      functionToCall = payDaoHodler
    } else {
      functionToCall = payCeatorHodler
    }

    handleExecuteExtended(0, tmpHodlers, functionToCall, async (err) => {
      if (err) return message.error(err.message)

      profile = await getSingleProfile(desoState.profile.Profile.PublicKeyBase58Check)
      daoData = await getDaoBalance(desoState.profile.Profile.PublicKeyBase58Check)
      dispatch({ type: Enums.reducers.SET_PROFILE_DESO, payload: profile })

      dispatch({
        type: Enums.reducers.SET_DESO_DATA,
        payload: { desoPrice: daoData.desoPrice, daoBalance: daoData.daoBalance }
      })

      setLoading(false)
      setIsExecuting(false)
    })
  }

  const handleExecuteExtended = (index, updatedHolders, functionToCall, callback) => {
    let publicKey = null
    let estimatedPayment = null
    let status = ''

    updatedHolders = updatedHolders.map((tmpHodler, tmpIndex) => {
      if (tmpIndex === index) {
        publicKey = tmpHodler.HODLerPublicKeyBase58Check
        estimatedPayment = tmpHodler.estimatedPayment

        return {
          ...tmpHodler,
          status: 'Processing...'
        }
      } else {
        return tmpHodler
      }
    })

    setHodlers(updatedHolders)

    functionToCall(desoState.profile.Profile.PublicKeyBase58Check, publicKey, estimatedPayment)
      .then(() => {
        status = 'Paid'
      })
      .catch((e) => {
        status = 'Error: ' + (e.message || e)
      })
      .finally(() => {
        updatedHolders = updatedHolders.map((tmpHodler, tmpIndex) => {
          if (tmpIndex === index) {
            return {
              ...tmpHodler,
              status
            }
          } else {
            return tmpHodler
          }
        })

        setHodlers(updatedHolders)
        index++

        if (index < updatedHolders.length) {
          handleExecuteExtended(index, updatedHolders, functionToCall, callback)
        } else {
          callback()
        }
      })
  }

  // eslint-disable-next-line
  Number.prototype.countDecimals = function () {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0
    return this.toString().split('.')[1].length || 0
  }

  return (
    <Row justify='center'>
      <Col xs={24} sm={22} md={20} lg={16} xl={12}>
        <Card type='inner' title={generateActions()} style={{ marginTop: 20, padding: '16px 5px' }}>
          <Row>
            <Col style={{ cursor: 'auto', marginLeft: 10 }}>
              <span style={{ fontSize: 15 }}>
                <b>DeSo Balance: </b>
              </span>
              {(desoState?.profile?.Profile?.DESOBalanceNanos / 1000000000).toFixed(2) +
                ' (~$' +
                Math.floor((desoState?.profile?.Profile?.DESOBalanceNanos / 1000000000) * desoState.desoPrice) +
                ') - $' +
                desoState.desoPrice +
                ' Per $DESO'}
            </Col>
          </Row>
          <Row justify='center'>
            <Col xs={16} md={12} lg={10} xl={8}>
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
          <Table
            dataSource={hodlers}
            loading={loading}
            style={{ marginTop: 20, marginLeft: 0 }}
            columns={[
              { title: 'User', dataIndex: ['ProfileEntryResponse', 'Username'], key: 'username' },
              {
                title: 'Coins',
                dataIndex: 'noOfCoins',
                key: 'noOfCoins'
              },
              {
                title: '% Ownership',
                dataIndex: 'percentOwnership',
                key: 'percentOwnership'
              },
              {
                title: 'Payment ($DESO)',
                dataIndex: 'estimatedPayment',
                key: 'estimatedPayment',
                render: (value) => {
                  return <span style={{ color: theme.twitterBootstrap.primary }}>{value}</span>
                }
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (value) => {
                  if (value === 'Paid') {
                    return <CheckCircleOutlined style={{ fontSize: 20, color: theme.twitterBootstrap.success }} />
                  } else if (value.indexOf('Error:') > -1) {
                    return (
                      <Popover content={<p>value</p>} title='DeSo Error'>
                        <CloseCircleOutlined style={{ fontSize: 20, color: theme.twitterBootstrap.danger }} />
                      </Popover>
                    )
                  } else {
                    return <span style={{ color: theme.twitterBootstrap.info }}>{value}</span>
                  }
                }
              }
            ]}
            pagination={false}
          />
        </Card>
      </Col>
    </Row>
  )
}

const BatchTransactionsForm = memo(_BatchTransactionsForm)

export default BatchTransactionsForm
