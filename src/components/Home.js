import React, { Component, Fragment } from 'react'
import Avatar from 'material-ui/Avatar'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back'
import Ionicon from 'react-ionicons'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import axios from 'axios'
import swal from 'sweetalert'

class Home extends Component {
  constructor () {
    super()
    this.guessTweet = this.guessTweet.bind(this)
    this.gotoGuessTweet = this.gotoGuessTweet.bind(this)
    this.addUser = this.addUser.bind(this)
    this.renderSearchResult = this.renderSearchResult.bind(this)
    this.searchUser = this.searchUser.bind(this)
    this.backButton = this.backButton.bind(this)
    this.renderTweets = this.renderTweets.bind(this)
    this.state = {
      screen: 'main',
      twits: localStorage.dataset === undefined ? [] : JSON.parse(localStorage.dataset),
      searchedUsers: []
    }
  }

  gotoGuessTweet () {
    const { twits } = this.state
    if (twits.length > 0) {
      this.setState({ screen: 'guess' })
    } else {
      swal('No Datasets','Try adding tweets to datasets','info')
    }
  }

  addButton () {
    return (
      <Fragment>
        <FloatingActionButton
          mini
          secondary
          style={{position: 'fixed', bottom: 100, right: 38}}
          onClick={ this.gotoGuessTweet }>
          <Ionicon icon="logo-twitter" fontSize='20px'/>
        </FloatingActionButton>
        <FloatingActionButton
          style={{position: 'fixed', bottom: 30, right: 30}}
          onClick={ () => this.setState({screen: 'add', searchedUsers: []}) }>
          <Ionicon icon="md-add" fontSize='30px'/>
        </FloatingActionButton>
      </Fragment>
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
    return twits.map( (twit, i) => {
      return <tr key={i}>
        <td><img src={twit.img} className='img-circle' /></td>
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
    swal("Add to Dataset ?", {
      buttons: {
        cancel: "Back",
        add: true,
      },
    })
    .then((value) => {
      if (value === 'add') {
        axios({
          method: 'post',
          url: 'http://localhost:4000/twit/tweets',
          data: {
            q: user.screen_name
          }
        }).then( data => {
          if (data.data.error === 'Not authorized.') {
            swal('Private Account', 'We can only get tweets from Public Accounts', 'warning')
          } else {
            let dataset = localStorage.dataset === undefined ? [] : JSON.parse(localStorage.dataset)
            let importDataSet = this.normalizeTweets(data.data, user.screen_name)
            dataset = dataset.filter( ds => ds.username !== importDataSet[0].username )
            dataset = dataset.concat(importDataSet)
            localStorage.setItem('dataset', JSON.stringify(dataset))
            this.setState({twits: (JSON.parse(localStorage.dataset)) })
            swal('Added', 'Added recent tweets to dataset', 'success')
          }
        })
      }
    })
  }

  guessTweet () {
    console.log('will guess tweet')
    const guess = this.refs.guessTweet.input.value
    const { twits } = this.state
    axios({
      method: 'post',
      url: 'http://localhost:4000/twit/guess',
      data: {
        guess,
        twits
      }
    }).then( data => {
      console.log('guessed tweet: ', data)
    })
  }

  normalizeTweets (tweets, screen_name) {
    let normalizedTweets = []
    tweets.map( tweet => {
      if (tweet.text.substring(0,2) !== 'RT' && tweet.user.screen_name === screen_name) {
        normalizedTweets.push({
          id: tweet.user.id,
          username: tweet.user.screen_name,
          img: tweet.user.profile_image_url,
          name: tweet.user.name,
          text: tweet.text
        })
      }
    })
    return normalizedTweets
  }

  renderSearchResult () {
    const { searchedUsers } = this.state
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
          <h2> Add Tweet to Dataset </h2>
          <TextField fullWidth hintText="Search Twitter username" onChange={ e => this.searchUser(e)}/>
        </div>
        <div>
         <List>{this.renderSearchResult()}</List>
        </div>
      </Fragment>
    )
  }

  guess () {
    return (
      <Fragment>
        { this.backButton() }
        <div style={{width: '90%', paddingLeft: '5%'}}>
          <h2> Guess the Tweet </h2>
          <div style={{display: 'flex'}}>
            <TextField fullWidth hintText="We will guess who would tweet this" ref='guessTweet'/>
            <FlatButton label='GUESS' primary onClick={this.guessTweet}/>
          </div>
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
      case 'guess':
        return this.guess()
        break
      default:
        return this.main()
    }
  }
}

export default Home
