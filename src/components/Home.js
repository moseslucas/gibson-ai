import React, { Component, Fragment } from 'react'
import Avatar from 'material-ui/Avatar'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back'
import Paper from 'material-ui/Paper'
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
    this.addButton = this.addButton.bind(this)
    this.learn = this.learn.bind(this)  
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
      learned: localStorage.learned === undefined ? false : JSON.parse(localStorage.learned),
      users: localStorage.users === undefined ? [] : JSON.parse(localStorage.users),
      searchedUsers: [],
      guessedUser: {name: '', username: '', img: ''}
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
    const { learned, users } = this.state
    return (
      <Fragment>
        <FloatingActionButton
          mini
          secondary
          disabled={ learned === false }
          style={{position: 'fixed', bottom: 150, right: 38}}
          onClick={ this.gotoGuessTweet }>
          <Ionicon icon="logo-twitter" fontSize='20px'/>
        </FloatingActionButton>
        <FloatingActionButton
          mini
          default
          disabled={ learned || users.length < 2 }
          style={{position: 'fixed', bottom: 100, right: 38}}
          onClick={ this.learn }>
          <Ionicon icon="md-cloud-upload" fontSize='20px'/>
        </FloatingActionButton>
        <FloatingActionButton
          disabled={ learned || users.length === 3 }
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
      url: 'https://gibson-ai-api-twit.herokuapp.com/twit/search',
      data: {
        q: e.target.value
      }
    }).then( data => this.setState({searchedUsers: data.data}))
  }

  addUser (user) {
    const { users } = this.state
    if (users.length < 3) {
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
            url: 'https://gibson-ai-api-twit.herokuapp.com/twit/tweets',
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

              let users = localStorage.users === undefined ? [] : JSON.parse(localStorage.users)
              users = users.concat(user)
              localStorage.setItem('users', JSON.stringify(users))
              this.setState({ users })

              swal('Added', 'Added recent tweets to dataset', 'success')
            }
          })
        }
      })
    } else {
      swal('Maximum 3', 'You can only add up to 3 users tweets', 'warning')
    }
  }

  guessTweet () {
    this.setState({ guessedUser: {} })
    const guess = this.refs.guessTweet.input.value
    const { twits, users } = this.state
    axios({
      method: 'post',
      url: 'https://gibson-ai-api-twit.herokuapp.com/twit/guess',
      data: {
        guess,
        twits
      }
    }).then( data => {
      const user = users.filter( user => user.screen_name === data.data )
      this.setState({
        guessedUser: {
          name: user[0].name,
          username: `@${user[0].screen_name}`,
          img: user[0].profile_image_url
        }
      })
      console.log('guessed tweet: ', data)
    })
  }

  learn () {
    swal("Upload tweets and train AI ?","This will replace the previous memories of the AI", {
      buttons: {
        cancel: "Back",
        TRAIN: true,
      },
    }).then( value => {
      if (value === 'TRAIN') {
        swal("TRAINING AI . . .", {
          closeOnClickOutside: false,
          buttons: {}
        })
        const { twits } = this.state
        axios({
          method: 'post',
          url: 'https://gibson-ai-api-twit.herokuapp.com/twit/learn',
          data: { twits }
        }).then( data => {
          swal('Done', 'Successfully trained AI with tweets', 'success')

          const learned = true
          localStorage.setItem('learned', JSON.stringify(learned))
          this.setState({ learned })

          console.log('learned ', data)
        })
      }
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
          text: tweet.text,
          output: { [tweet.user.screen_name]: 1 }
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
    const { users } = this.state
    return (
      <Fragment>
        { this.backButton('main') } <br />
        <div style={{width: '90%', paddingLeft: '5%'}}>
          <h2> Add Tweet to Dataset <small> ( {3-users.length} ) </small></h2>
          <TextField fullWidth hintText="Search Twitter username" onChange={ e => this.searchUser(e)}/>
        </div>
        <div>
         <List>{this.renderSearchResult()}</List>
        </div>
      </Fragment>
    )
  }

  guess () {
    const { guessedUser } = this.state
    const style = {
      height: 100,
      margin: 20,
      textAlign: 'center',
      display: 'flex',
      flex: 1
    }
    return (
      <Fragment>
        { this.backButton() }
        <div style={{width: '90%', paddingLeft: '5%'}}>
          <h2> This Tweet is for . . . </h2>
          <div style={{display: 'flex'}}>
            <TextField fullWidth hintText="We will guess who would tweet this" ref='guessTweet'/>
            <FlatButton label='GUESS' primary onClick={this.guessTweet}/>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <Paper style={style} zDepth={2}>
              <List>
                <ListItem
                  secondaryText={<p><span>{guessedUser.username}</span></p>}
                  secondaryTextLines={4}
                  primaryText={guessedUser.name}
                  leftAvatar={<Avatar src={guessedUser.img} />} />
              </List>
            </Paper>
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
