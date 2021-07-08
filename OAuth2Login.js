import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PopupWindow from './PopupWindow';
import { toQuery } from './utils';

import ReactDOM from 'react-dom'

class OAuth2Login extends Component {
  static propTypes = {
    buttonText: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    clientId: PropTypes.string.isRequired,
    onRequest: PropTypes.func,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    popupHeight: PropTypes.number,
    popupWidth: PropTypes.number,
    redirectUri: PropTypes.string,
    scope: PropTypes.string,
    state: PropTypes.string,
    disabled: PropTypes.bool
  }

  static defaultProps = {
    buttonText: 'Sign in',
    redirectUri: '',
    authorizeUri: '',
    state: '',
    scope: '',
    responseType: 'code',
    popupHeight: 650,
    popupWidth: 500,
    onRequest: () => {},
    onSuccess: () => {},
    onFailure: () => {},
  }

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      repos: null,
    }
  }

  getUser(username) {
    return fetch(`https://api.github.com/users/${username}`)
      .then(response => response.json())
      .then(response => {
        return response
      })
  }

  getUserRepo(username) {
    return fetch(`https://api.github.com/users/${username}/repos`)
      .then(response => response.json())
      .then(response => {
        return response
      })
  }

  // async handleSubmit(e) {
  //   e.preventDefault()

  //   const { value } = this.refs.username
  //   let user = await this.getUser(value)
  //   let repos = await this.getUserRepo(value)

  //   this.setState({
  //     user: {
  //       avatar_url: user.avatar_url,
  //       username: user.login,
  //       followers: user.followers,
  //       following: user.following,
  //       url: user.url,
  //     },
  //     repos,
  //   })
  // }

  renderRepos(repos) {
    return repos.map(item => {
      return <div key={item.id} className="repoResults">
        <p>
          {item.name}
        </p>
      </div>
    })
  }

  renderUser(user) {
    return (
      <div className="resultBadge">
        <img src={user.avatar_url} />
        <p className="userInfo">
          Username: <br />
          {user.username}
        </p>
        <p className="followerInfo">
          {user.followers} Followers
                </p>
        <p className="followingInfo">
          Following {user.following} users
                </p>
      </div>
    )
  }

  onBtnClick = () => {
    const {
      authorizeUri, clientId, scope, redirectUri, responseType, state,
      popupHeight, popupWidth
    } = this.props;
    const search = toQuery({
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      response_type: responseType,
      state,
    });

    // To fix issues with window.screen in multi-monitor setups, the easier option is to
    // center the pop-up over the parent window.
    const top = window.top.outerHeight / 2 + window.top.screenY - (popupHeight / 2);
    const left = window.top.outerWidth / 2 + window.top.screenX - (popupWidth / 2);

    const url = `${authorizeUri}?${search}`;
    const popup = this.popup = PopupWindow.open(
      'github-oauth2-authorize',
      url,
      {
        height: popupHeight,
        width: popupWidth,
        top: top,
        left: left
      }
    );

    this.onRequest();
    popup.then(
      data => this.onSuccess(data),
      error => this.onFailure(error)
    );
  }

  onRequest = () => {
    this.props.onRequest();
  }

  onSuccess = (data) => {
    if (data.error) {
      return this.onFailure(new Error(`'${data.error}': ${decodeURI(data.error_description)}`));
    }

    if (!data.code) {
      return this.onFailure(new Error(`'code' not found: ${JSON.stringify(data)}`));
    }

    this.props.onSuccess(data);
  }

  onFailure = (error) => {
    this.props.onFailure(error);
  }

  render() {
    const { user, repos } = this.state
    const { className, buttonText, children, disabled } = this.props;
    const attrs = {
      onClick: this.onBtnClick,
      className: className || '',
      disabled: disabled || false
    };

    return (
      <div className="GitHubSearch">
        <button {...attrs}>{ children || buttonText }</button>
        
        <header className="Search-header">
          <h1>Github User Search </h1>
        </header>
        <form>
          <input ref='username' type='text' placeholder='username' />
        </form>
        <div className="Search-intro">
          <h4> User info: </h4>
          {user && this.renderUser(user)}
        </div>
        <div>
          <h4> Repos: </h4>
          {repos && this.renderRepos(repos)}
        </div>
      </div>


    )


  }
}

export default OAuth2Login;
