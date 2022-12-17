import { Col, Row } from 'antd'
import DeSoBanner from '../../resources/deso-banner.png'

const Home = () => {
  return (
    <Row justify='center'>
      <Col>
        <h2 style={{ textAlign: 'center' }}>Welcome to the Creator Admin Portal</h2>
        <img src={DeSoBanner} alt='deso banner' />
      </Col>
    </Row>
  )
}

export default Home
