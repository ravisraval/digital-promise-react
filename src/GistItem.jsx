import React from 'react';
import { Button } from 'react-bootstrap';

class GistItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { gist } = this.props;
    const description = (
      gist.description === '' ? '(no description)' : gist.description
    )
    return(
      <li>
        <Button bsStyle="link" onClick={() => this.props.openModal(gist)}>
          { description }
        </Button>
      </li>
    )
  }
}

export default GistItem;
