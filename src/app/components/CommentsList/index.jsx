import './styles.less';

import React from 'react';

import { map } from 'lodash/collection';

import Comment from '../Comment';

export default (props) => {
  const { commentRecords, parentComment, postCreated, user, op, nestingLevel } = props;

  return (
    <div className={ `CommentsList ${props.className || ''}` }>

      { map(commentRecords, record => {
        return (
          <Comment
            key={ `comment-id-${record.uuid}` }
            commentId={ record.uuid }
            parentComment= { parentComment }
            postCreated={ postCreated }
            user={ user }
            op={ op }
            nestingLevel={ nestingLevel }
          />
        );
      }) }
    </div>
  );
};