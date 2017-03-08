import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from 'platform/components';
import * as subredditAutocompleteActions from 'app/actions/subredditAutocomplete';
import DismissiblePage from 'app/components/DismissiblePage';
import './styles.less';

const T = React.PropTypes;

const COMMUNITY_DEFAULT = 'Search for a community';
const AUTOCOMPLETE_TITLE = 'Communities';
const RECENT_COMMUNITY_TITLE = 'Recently visited';
const SUBREDDIT_LIMIT = 10;

class PostSubmitCommunity extends React.Component {
  static propTypes = {
    title: T.string.isRequired,
    submissionType: T.string.isRequired,
    subreddits: T.array.isRequired,
    onSubredditInput: T.func.isRequired,
    onExit: T.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.onSubredditInput = e => props.onSubredditInput(e.target.value);
    this.renderSubredditRow = this.renderSubredditRow.bind(this);
  }

  render() {
    const { onExit, title, subreddits, submissionType } = this.props;

    return (
      <DismissiblePage
        exitTo={ `/submit?type=${submissionType}` }
        onExit={ onExit }
        titleText='Post to a community'
      >
        <div className='PostSubmitCommunity'>
          <div className='PostSubmitCommunity__search'>
            <div className='icon icon-search'></div>
            <div className='PostSubmitCommunity__search-input'>
              <input
                placeholder={ COMMUNITY_DEFAULT }
                onChange={ this.onSubredditInput }
              />
            </div>
          </div>

          <div className='PostSubmitCommunity__subreddits'>
            <div className='PostSubmitCommunity__subreddits-title'>
              { title }
            </div>
            <div className='PostSubmitCommunity__subreddits-list'>
              { subreddits.map(this.renderSubredditRow) }
            </div>
          </div>
        </div>
      </DismissiblePage>
    );
  }

  renderSubredditRow({ name, iconUrl }) {
    const { submissionType } = this.props;
    const style = iconUrl ? { backgroundImage: `url(${iconUrl})` } : null;

    return (
      <Anchor
        className='PostSubmitCommunity__subreddits-row'
        key={ name }
        href={ `/r/${name}/submit?type=${submissionType}` }
      >
        <div className='PostSubmitCommunity__subreddits-icon'>
          <div className='PostSubmitCommunity__subreddits-icon-snoo' style={ style }></div>
        </div>
        <div className='PostSubmitCommunity__subreddits-name'>
          { `r/${name}` }
        </div>
      </Anchor>
    );
  }
}


const mapStateToProps = createSelector(
  state => state.autocompleteSubreddits,
  state => state.recentSubreddits,
  state => state.subreddits,
  state => state.posting.currentType,
  (autocompleteSubreddits, recentSubreddits, subreddits, submissionType) => {
    // normalize subreddit meta data
    if (autocompleteSubreddits.subredditNames.length) {
      const subreddits = autocompleteSubreddits.subredditNames.slice(0, SUBREDDIT_LIMIT);
      return {
        submissionType,
        title: AUTOCOMPLETE_TITLE,
        subreddits: subreddits.map(subredditName => {
          return { name: subredditName, iconUrl: null };
        }),
      };
    }

    return {
      submissionType,
      title: RECENT_COMMUNITY_TITLE,
      subreddits: recentSubreddits.slice(0, SUBREDDIT_LIMIT).map(subredditName => {
        const subredditMetaData = subreddits[subredditName];
        const iconUrl = subredditMetaData ? subredditMetaData.iconImage : null;
        return { name: subredditName, iconUrl };
      }),
    };
  }
);

const dispatcher = dispatch => ({
  onSubredditInput: val => dispatch(subredditAutocompleteActions.fetch(val)),
  onExit: () => dispatch(subredditAutocompleteActions.reset()),
});

export default connect(mapStateToProps, dispatcher)(PostSubmitCommunity);
