import React, { Component, Fragment } from 'react'
import Avatar from 'material-ui/Avatar'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back'
import Ionicon from 'react-ionicons'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import axios from 'axios'

class Home extends Component {
  constructor () {
    super()
    this.renderSearchResult = this.renderSearchResult.bind(this)
    this.searchUser = this.searchUser.bind(this)
    this.backButton = this.backButton.bind(this)
    this.renderTweets = this.renderTweets.bind(this)
    this.state = {
      screen: 'main',
      twits: [
        {id: 1, img: 'http://pbs.twimg.com/profile_images/966996444245716992/RX8-8Z-e_normal.jpg', username: 'lukeses09', name: 'Moses Lucas', text: 'Test Tweet' }
      ],
      searchedUsers: []
    }
  }

  componentDidMount () {
  }

  addButton () {
    return (
      <FloatingActionButton
        style={{position: 'absolute', bottom: 30, right: 30}}
        onClick={ () => this.setState({screen: 'add', searchedUsers: []}) }>
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

  searchUser (e) {
    axios({
      method: 'post',
      url: 'http://localhost:4000/twit/search',
      data: {
        q: e.target.value
      }
    }).then( data => this.setState({searchedUsers: data.data}))
  }

  addUser (user) {
  }
  renderSearchResult () {
    const { searchedUsers } = this.state
    console.log(searchedUsers)
    if (searchedUsers.length > 0) {
      return searchedUsers.map( user => {
        return (
          <ListItem
            onClick={() => this.addUser(user)}
            primaryText={user.name}
            secondaryText={<p><span>{`@${user.screen_name}`}</span> --{user.description}</p>}
            secondaryTextLines={2}
            leftAvatar={<Avatar src={user.profile_image_url} />}
          />
        )
      })
    } else {
      return (
        <ListItem primaryText='No Match' />
      )
    }
  }

  add () {
    return (
      <Fragment>
        { this.backButton('main') } <br />
        <div style={{width: '90%', paddingLeft: '5%'}}>
          <TextField fullWidth hintText="Search Twitter username" onChange={ e => this.searchUser(e)}/>
        </div>
        <div>
         <List>{this.renderSearchResult()}</List>
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
        return this.main()
    }
  }
}

export default Home
