import { Button, Col, Row, Spin } from 'antd'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Enums from '../../agilite-react/resources/enums'
import theme from '../../agilite-react/resources/theme'
import { desoLogin, desoLogout, getDaoBalance, getSingleProfile } from '../controller'

const DesoLogin = () => {
  const desoState = useSelector((state) => state.agiliteReact.deso)
  const dispatch = useDispatch()
  const [daoBalance, setDaoBalance] = useState(0)
  const [desoPrice, setDesoPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    let profile = null

    setLoading(true)

    try {
      profile = await getSingleProfile(desoState.profile.Profile.PublicKeyBase58Check)
      await handleGetDoaBalance(desoState.profile.Profile.PublicKeyBase58Check)
      dispatch({ type: Enums.reducers.SET_PROFILE_DESO, payload: profile })
    } catch (e) {
      console.log(e)
    }

    setLoading(false)
  }

  const handleDesoLogin = async () => {
    let response = null
    let profile = null

    setLoading(true)

    try {
      response = await desoLogin()
      profile = await getSingleProfile(response.publicKeyAdded)
      await handleGetDoaBalance(profile.Profile.PublicKeyBase58Check)
      dispatch({ type: Enums.reducers.SIGN_IN_DESO })
      dispatch({ type: Enums.reducers.SET_PROFILE_DESO, payload: profile })
    } catch (e) {
      console.log(e)
    }

    setLoading(false)
  }

  const handleDesoLogout = async () => {
    try {
      await desoLogout(desoState.profile.Profile.PublicKeyBase58Check)
      dispatch({ type: Enums.reducers.SIGN_OUT_DESO })
    } catch (e) {
      console.log(e)
    }
  }

  const handleGetDoaBalance = async (publicKey) => {
    let data = null

    try {
      data = await getDaoBalance(publicKey)
      setDaoBalance(data.balance)
      setDesoPrice(data.priceDeso)
      dispatch({ type: Enums.reducers.SET_DESO_PRICE, payload: data.priceDeso })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      {!loading ? (
        <Row>
          {desoState.loggedIn ? (
            <Row justify='space-between'>
              <Col style={{ marginRight: 20, cursor: 'auto' }}>
                <div>Username: {desoState?.profile?.Profile?.Username}</div>
              </Col>
              <Col style={{ marginRight: 20, cursor: 'auto' }}>
                <div>DAO Coins: {daoBalance}</div>
              </Col>
              <Col style={{ marginRight: 20, cursor: 'auto' }}>
                <div>
                  DeSo Balance:{' '}
                  {(desoState?.profile?.Profile?.DESOBalanceNanos / 1000000000).toFixed(2) +
                    ' = $' +
                    Math.floor((desoState?.profile?.Profile?.DESOBalanceNanos / 1000000000) * desoPrice) +
                    ' ($' +
                    desoPrice +
                    '/$DESO)'}
                </div>
              </Col>
              <Col style={{ marginRight: 20 }}>
                <Button type='primary' onClick={handleDesoLogout}>
                  DeSo Logout
                </Button>
              </Col>
            </Row>
          ) : (
            <Col>
              <Button type='primary' onClick={handleDesoLogin}>
                DeSo Login
              </Button>
            </Col>
          )}
          <Col>
            {desoState.loggedIn ? (
              <Button
                type='default'
                onClick={() => handleRefresh()}
                style={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.primary }}
              >
                Refresh
              </Button>
            ) : null}
          </Col>
        </Row>
      ) : (
        <Spin />
      )}
    </div>
  )
}

export default DesoLogin
