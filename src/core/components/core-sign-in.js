import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Form, Input, Button, Row, Col, Spin, Card, message } from 'antd'
import { MailFilled, LockFilled } from '@ant-design/icons'

import AgiliteReactEnums from '../../agilite-react/resources/enums'
import { signInUser } from '../core-utils'
import MemoryStore from '../../utils/memory-store'

const SignIn = () => {
  const dispatch = useDispatch()
  const [signInClicked, setSignInClicked] = useState(false)
  const entry = MemoryStore.signInForm

  const onChange = (key, value) => {
    entry[key] = value
  }

  const handleSignInClick = async () => {
    try {
      setSignInClicked(true)

      await signInUser()

      setSignInClicked(false)
      dispatch({ type: AgiliteReactEnums.reducers.SIGN_IN })
    } catch (error) {
      setSignInClicked(false)
      message.error(error)
    }
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
          <Card title='Sign in below to access the Portal' type='inner'>
            <Form onFinish={handleSignInClick}>
              <Form.Item>
                <Input
                  style={{ borderRadius: 5 }}
                  prefix={<MailFilled />}
                  type='email'
                  placeholder='Email'
                  defaultValue={entry.email}
                  required
                  onChange={(e) => {
                    onChange('email', e.target.value)
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  style={{ borderRadius: 5 }}
                  prefix={<LockFilled />}
                  required
                  placeholder='Password'
                  type='password'
                  defaultValue={entry.password}
                  onChange={(e) => {
                    onChange('password', e.target.value)
                  }}
                />
              </Form.Item>
              <Row type='flex' justify='center'>
                <Col>
                  <Form.Item>
                    <Button
                      htmlType='submit'
                      style={{
                        backgroundColor: 'green',
                        color: 'white',
                        width: '100%',
                        marginRight: 10,
                        borderRadius: 5,
                        fontSize: 16,
                        height: 'auto'
                      }}
                    >
                      Sign In
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            {signInClicked === true ? (
              <Spin size='medium' style={{ position: 'absolute', left: '49%', top: '88%' }} />
            ) : null}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SignIn
