import React, { Component, Fragment } from 'react'
import Avatar from 'material-ui/Avatar'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back'
import Ionicon from 'react-ionicons'
import TextField from 'material-ui/TextField'

class Home extends Component {
  constructor () {
    super()
    this.backButton = this.backButton.bind(this)
    this.renderTweets = this.renderTweets.bind(this)
    this.state = {
      screen: 'main',
      twits: [
        {id: 1, img: 'http://pbs.twimg.com/profile_images/966996444245716992/RX8-8Z-e_normal.jpg', username: 'lukeses09', name: 'Moses Lucas', text: 'Test Tweet' }
      ]
    }
  }

  addButton () {
    return (
      <FloatingActionButton
        style={{position: 'absolute', bottom: 30, right: 30}}
        onClick={ () => this.setState({screen: 'add'}) }>
        <Ionicon icon="md-add" fontSize='30px'/>
      </FloatingActionButton>
    )
  }

  backButton (screen) {
    return (
      <IconButton onClick={()=> this.setState({ screen })}>
        <ArrowBack/>
      </IconButton>
    )
  }

  renderTweets () {
    const { twits } = this.state
    return twits.map( twit => {
      return <tr key={twit.id}>
        <td><img src={twit.img} className='img-circle' /></td>
        <td>{twit.username}</td>
        <td>{twit.name}</td>
        <td>{twit.text}</td>
      </tr>
    })
  }

  add () {
    return (
      <Fragment>
        { this.backButton('main') } <br />
        <div style={{width: '90%', paddingLeft: '5%'}}>
          <TextField fullWidth hintText="Search Twitter username" />
        </div>
      </Fragment>
    )
  }
  main () {
    return (
      <Fragment>
        { this.addButton() }
        <table className='table table-striped table-hover'>
          <thead>
            <tr>
              <th></th>
              <th>Username</th>
              <th>Name</th>
              <th>Tweet</th>
            </tr>
          </thead>
          <tbody>{this.renderTweets()}</tbody>
        </table>
      </Fragment>
    )
  }

  render () {
    const { screen } = this.state
    switch (screen) {
      case 'add':
        return this.add()
        break
      default:
        return this.add()
        // return this.main()
    }
  }
}

export default Home
