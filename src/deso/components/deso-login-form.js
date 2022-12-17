import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Form, Button, Row, Col, Spin } from 'antd'

import Enums from '../../agilite-react/resources/enums'
import { desoLogin, getSingleProfile } from '../controller'

const DeSoLoginForm = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleDesoLogin = async () => {
    let response = null
    let profile = null

    setLoading(true)

    try {
      response = await desoLogin()
      profile = await getSingleProfile(response.publicKeyAdded)
      dispatch({ type: Enums.reducers.SIGN_IN_DESO })
      dispatch({ type: Enums.reducers.SET_PROFILE_DESO, payload: profile })
    } catch (e) {
      console.log(e)
    }

    setLoading(false)
  }

  return (
    <div style={{ marginTop: 20 }}>
      <Row type='flex' justify='center'>
        <Col xs={24} sm={16} md={12} lg={8}>
          <div>
            <center>
              <h2 style={{ color: '#7d7e81' }}>Welcome to the {process.env.REACT_APP_NAME}</h2>
            </center>
          </div>
          <br />
          <Row type='flex' justify='center'>
            <Col>
              <Form.Item>
                <Button
                  onClick={handleDesoLogin}
                  style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    width: '100%',
                    marginRight: 10,
                    borderRadius: 5,
                    fontSize: 16,
                    height: 'auto'
                  }}
                >
                  Sign In With DeSo
                </Button>
              </Form.Item>
            </Col>
          </Row>
          {loading ? <Spin size='medium' style={{ position: 'absolute', left: '49%', top: '88%' }} /> : null}
        </Col>
      </Row>
    </div>
  )
}

export default DeSoLoginForm
