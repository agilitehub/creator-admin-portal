import { Button, Col, Row, Spin } from 'antd'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import AgiliteReactEnums from '../../agilite-react/resources/enums'
import theme from '../../agilite-react/resources/theme'
import { desoLogout, getDaoBalance, getSingleProfile } from '../controller'
import Enums from '../../utils/enums'

// Components
import DeSoLoginForm from './deso-login-form'

const DesoToolbar = () => {
  const desoState = useSelector((state) => state.agiliteReact.deso)
  const loggedIn = useSelector((state) => state.agiliteReact.deso.loggedIn)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    let profile = null

    setLoading(true)

    try {
      profile = await getSingleProfile(desoState.profile.Profile.PublicKeyBase58Check)
      await handleGetDoaBalance(desoState.profile.Profile.PublicKeyBase58Check)
      dispatch({ type: AgiliteReactEnums.reducers.SET_PROFILE_DESO, payload: profile })
    } catch (e) {
      console.log(e)
    }

    setLoading(false)
  }

  const handleDesoLogout = async () => {
    try {
      await desoLogout(desoState.profile.Profile.PublicKeyBase58Check)
      dispatch({ type: AgiliteReactEnums.reducers.SIGN_OUT_DESO })

      dispatch({
        type: AgiliteReactEnums.reducers.ADD_TAB,
        payload: {
          key: Enums.tabKeys.DESO_LOGIN,
          closable: false,
          title: '',
          content: <DeSoLoginForm />
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const handleGetDoaBalance = async (publicKey) => {
    let data = null

    try {
      data = await getDaoBalance(publicKey)

      dispatch({
        type: AgiliteReactEnums.reducers.SET_DESO_DATA,
        payload: { desoPrice: data.desoPrice, daoBalance: data.daoBalance }
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      {!loading ? (
        <div>
          {loggedIn ? (
            <Row justify='space-between'>
              <Col style={{ marginRight: 20, cursor: 'auto' }}>
                <div>Username: {desoState?.profile?.Profile?.Username}</div>
              </Col>
              <Col style={{ marginRight: 20 }}>
                <Button type='primary' onClick={handleDesoLogout}>
                  Logout
                </Button>
              </Col>
              <Col>
                <Button
                  type='default'
                  onClick={() => handleRefresh()}
                  style={{ color: 'white', fontWeight: 'bold', backgroundColor: theme.primary }}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          ) : null}
        </div>
      ) : (
        <Spin />
      )}
    </div>
  )
}

export default DesoToolbar
