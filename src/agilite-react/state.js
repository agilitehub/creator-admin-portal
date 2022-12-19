import { handleMenuItemClick, handleMenuAction, handleTabAction } from './controller'
import { initLeftMenuItems } from '../agilite-react-setup'
import Theme from './resources/theme'

// Components
import DeSoLoginForm from '../deso/components/deso-login-form'
import DesoToolbar from '../deso/components/deso-toolbar'

const state = {
  tabNavigation: {
    enabled: false,
    rootTabKey: 'home',
    rootTabTitle: 'Batch Transactions',
    activeKey: 'home',
    tabs: [],
    animated: false,
    onTabChange: (key) => handleTabAction('change', key),
    onTabClose: (key) => handleTabAction('close', key)
  },
  leftMenu: {
    leftMenuEnabled: false,
    visible: false,
    leftMenuTitle: 'Apps',
    menuItems: initLeftMenuItems(),
    onLeftMenuItemClick: (event) => handleMenuItemClick(event),
    onLeftMenuOpen: () => handleMenuAction('open'),
    onLeftMenuClose: () => handleMenuAction('close')
  },
  toolbar: {
    enabled: true,
    title: process.env.REACT_APP_NAME,
    customMenus: {
      content: <DesoToolbar />
    }
  },
  theme: Theme,
  rootContent: DeSoLoginForm,
  deso: {
    loggedIn: false,
    profile: null,
    desoPrice: 0,
    daoBalance: 0
  }
}

export default state
