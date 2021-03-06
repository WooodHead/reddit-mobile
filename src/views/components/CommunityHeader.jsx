import React from 'react';
import constants from '../../constants';
import propTypes from '../../propTypes';
import { models } from '@r/api-client';

import formatNumber from '../../lib/formatNumber';

import BaseComponent from './BaseComponent';

const { NIGHTMODE } = constants.themes;
const UTF8Circle = '●';

class CommunityHeader extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
      theme: props.theme,
    };

    this.state.subreddit = props.subreddit;
    this._onSubscribeToggle = this._onSubscribeToggle.bind(this);
    this._removeErrorRow = this._removeErrorRow.bind(this);
    this.updateTheme = this.updateTheme.bind(this);
  }

  componentDidMount() {
    this.props.app.on(constants.THEME_TOGGLE, this.updateTheme);
  }

  componentWillUnmount() {
    this.props.app.off(constants.THEME_TOGGLE, this.updateTheme);
  }

  updateTheme(theme) {
    this.setState({ theme });
  }

  renderErrorMessage(error) {
    if (!error) {
      return false;
    }

    return (
      <div className='CommunityHeader-error row alert alert-danger alert-bar'>
        There was a problem, please try again
        <span
          className='CommunityHeader-clear-error-icon icon-clear white'
          onClick={ this._removeErrorRow }
        />
      </div>
    );
  }

  renderBannerRow(subreddit) {
    const iconUrl = subreddit.icon_img;
    const { theme } = this.state;

    const iconStyle = {};
    const iconClass = ['CommunityHeader-banner-icon-holder'];

    if (iconUrl) {
      iconStyle.backgroundImage = `url(${iconUrl})`;
      iconClass.push('CommunityHeader-banner-icon-holder-image');
    }

    const bannerStyle = {};
    const bannerClass = ['CommunityHeader-banner'];

    if (subreddit.key_color) {
      if (theme === NIGHTMODE) {
        iconStyle.borderColor = subreddit.key_color;

        if (iconStyle.backgroundImage) {
          iconStyle.backgroundColor = subreddit.key_color;
        }
      } else {
        bannerStyle.backgroundColor = subreddit.key_color;
      }
    }

    if (subreddit.banner_img) {
      bannerClass.push('m-with-banner');
      bannerStyle.backgroundImage = `url(${subreddit.banner_img})`;
    }

    return (
      <div className={ bannerClass.join(' ') } style={ bannerStyle }>
        <div className={ iconClass.join(' ') } style={ iconStyle } />
      </div>
    );
  }

  render() {
    if (!this.state.subreddit) {
      return false;
    }

    const { subreddit, error } = this.state;
    const subscriber = subreddit.user_is_subscriber;

    let onlineCount;
    if (subreddit.accounts_active) {
      onlineCount = ` ${UTF8Circle} ${formatNumber(subreddit.accounts_active)} online`;
    }

    const followIcon = subscriber ? 'icon-check-circled lime' : 'icon-follow blue';
    const errorMessageOrFalse = this.renderErrorMessage(error);

    const banner = this.renderBannerRow(subreddit);

    return (
      <div className={ `CommunityHeader ${ error ? 'with-error' : '' }` }>
        { banner }

        <div className='CommunityHeader-text-row'>
          <h4 className='CommunityHeader-community-title'>
            { subreddit.display_name }
          </h4>
        </div>

        <div className='CommunityHeader-text-row'>
          <span>{ `${formatNumber(subreddit.subscribers)} subscribers` }</span>
          { onlineCount }
          { ` ${UTF8Circle}` }
          <span
            className='CommunityHeader-text-row-blue'
            onClick={ this._onSubscribeToggle }
          >
            { ` ${subscriber ? 'Subscribed' : 'Subscribe'} ` }
            <button
              className='CommunityHeader-subscribe-button'
            >
              <span
                className={ `CommunityHeader-subscribe-icon ${ followIcon}` }
              />
            </button>
          </span>
        </div>
        { errorMessageOrFalse }
      </div>
    );
  }

  _toggleSubredditSubscribedState() {
    const subreddit = this.state.subreddit;
    this.setState({ subreddit: {
      ...subreddit,
      user_is_subscriber: !subreddit.user_is_subscriber,
    }});
  }

  _removeErrorRow() {
    this.setState({ error: false });
  }

  _onSubscribeToggle() {
    if (this.props.app.needsToLogInUser()) { return; }

    const subreddit = this.state.subreddit;
    const props = this.props;

    const subscription = new models.Subscription({
      action: subreddit.user_is_subscriber ? 'unsub' : 'sub',
      sr: subreddit.name,
    });

    const options = {
      ...this.props.apiOptions,
      model: subscription,
      id: subreddit.id,
    };

    // toggle the ui for now, including clearing the error, until we get a response
    this._toggleSubredditSubscribedState();
    this.setState({ error: false });

    props.app.api.subscriptions.post(options)
      .then(function (data) {
        // if it fails revert back to the original state
        if (Object.keys(data).length) {
          this._toggleSubredditSubscribedState();
          this.setState({ error: true });
        } else {
          this.props.app.emit(constants.USER_DATA_CHANGED);
        }
      }.bind(this));
  }

  static propTypes = {
    subreddit: propTypes.subreddit,
  };
}

export default CommunityHeader;
