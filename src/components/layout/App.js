import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import  'bootstrap/dist/css/bootstrap.min.css'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import Menu from 'material-ui/svg-icons/navigation/menu'
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import {Link} from 'react-router-dom'
import swal from 'sweetalert'

class App extends React.Component{
  constructor (props) {
    super(props)
    this.clearDataSet = this.clearDataSet.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
    this.closeDrawer = this.closeDrawer.bind(this)
    this.state = {
      openDrawer: false
    }
  }

  clearDataSet() {
    localStorage.clear()
    swal('Cleared', 'All dataset has been cleared', 'info')
    location.reload()
  }

  toggleDrawer () {
    this.setState({ openDrawer: !this.state.openDrawer })
  }

  closeDrawer () {
    this.setState({ openDrawer: false })
  }

  render () {
    return <MuiThemeProvider>
      <AppBar
        title="GIBSON AI"
        iconElementLeft={
          <IconButton onClick={this.toggleDrawer}>
            <Menu />
          </IconButton>
        }
      />  
      <Drawer
        docked={false}
        width={250}
        open={this.state.openDrawer}
        onRequestChange={(openDrawer) => this.setState({openDrawer})}>
        {/* <Link to='/'><MenuItem onClick={this.closeDrawer}> Home </MenuItem></Link> */}
        <MenuItem onClick={this.clearDataSet}> Clear Dataset </MenuItem>
        <a target='_new' href='https:/github.com/moseslucas/gibson-ai'><MenuItem onClick={this.closeDrawer}> Check on Github </MenuItem></a>
        <a target='_new' href='https:/github.com/moseslucas/gibson-ai-api'><MenuItem onClick={this.closeDrawer}> API </MenuItem></a>
      </Drawer>
      {this.props.children}
    </MuiThemeProvider>
  }
}

export default App
