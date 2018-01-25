import React from 'react';
import axios from 'axios';
import { Button, Modal, FormGroup, FormControl } from 'react-bootstrap';

class GistShow extends React.Component {
  constructor(props) {
    super(props);
    const { gist } = this.props;
    this.state = {
      detailedGist: null,
      content: '',
      description: gist.description,
      filename: gist.files[Object.keys(gist.files)[0]].filename,
      oldFilename: gist.files[Object.keys(gist.files)[0]].filename,
      starred: null,
      updateAllowed: false,
      txtUpdated: null,
      starUpdated: false
    };

    this.toggleStar = this.toggleStar.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateGist = this.updateGist.bind(this);
  }

  componentDidMount() {
    const gist = this.props.gist;
    // assuming each gist has only one file,
    // as all digital promise test files do
    // if each gist had multiple files, would have to do some nesting here

    // grab 'content' for specific gist
    axios.get(gist.files[Object.keys(gist.files)[0]].raw_url, {
      params: {
        'access_token': process.env.REACT_APP_TOKEN,
        'date': Date.now()
      }
    })
    .then( response => {
      this.setState({ content: response.data })
    })
    .catch( error => {
      console.log(error);
    });

    // check if starred
    axios.get(`https://api.github.com/gists/${gist.id}/star`, {
      params: {
        'access_token': process.env.REACT_APP_TOKEN,
        'date': Date.now() // avoid reusing cached data
      }
    })
    .then( response => {
      this.setState({ starred: true })
    })
    .catch( error => {
      if (error.response.status === 404) {
        console.info('Expected 404 - means Gist is unstarred');
      }
      this.setState({ starred: false })
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const { name, value } = target;
    this.setState({
      [name]: value, updateAllowed: true,
      txtUpdated: null, starUpdated: false
    });
  }

  updateGist() {
    const gist = this.props.gist;
    const { content, description, filename, oldFilename } = this.state;
    const data = {
      'description': description,
      'files': {
        [filename]: {
          'filename': filename,
          'content': content
        }
      }
    }
    // if we're renaming the file, gotta specify deleting the old one
    // otherwise, github keeps the old file
    Object.assign(data.files,
      filename !== oldFilename ? {[oldFilename]: null} : null
    );

    axios.patch(`https://api.github.com/gists/${gist.id}`, data, {
      params: {
        'access_token': process.env.REACT_APP_TOKEN,
        content: content
      }
    })
    .then( response => {
      this.setState({
        txtUpdated: true, updateAllowed: false, starUpdated: false
      },
        // if we change stuff, make sure gist-list is accurate
        this.props.refresh()
      );
    })
    .catch( error => {
      this.setState({ txtUpdated: false, starUpdated: false });
    });
  }

  toggleStar() {
    const gist = this.props.gist;

    if (this.state.starred) {
      axios.delete(`https://api.github.com/gists/${gist.id}/star`, {
        params: {
          'access_token': process.env.REACT_APP_TOKEN
        }
      })
      .then( response => {
        this.setState({
          starred: false, starUpdated: true, txtUpdated: null
        })
      })
      .catch( error => {
        console.log('error', error);
      });
    } else {
      axios({
        method:'put',
        url:`https://api.github.com/gists/${gist.id}/star`,
        headers: {
          'Authorization': `token ${process.env.REACT_APP_TOKEN}`
        }
      })
      .then( response => {
        this.setState({
          starred: true, starUpdated: true, txtUpdated: null
        });
      })
      .catch( error => {
        console.log('error', error);
      });
    }
  }

  render() {
    const { starred, txtUpdated, starUpdated } = this.state
    const starBtnText = ( starred ? 'Unstar' : 'Star' )
    const starBtnStyle = ( starred ? 'danger' : 'success' )

    const updatedText = ( () => {
      if (txtUpdated) {
        return 'Update Successful!';
      } else if (txtUpdated === false) {
        return 'Issue with update.';
      } else if (starUpdated) {
        if (starred) {
          return 'Starred';
        } else {
          return 'Unstarred';
        }
      } else {
        return '';
      }
    })();

    return(
      <div>
        <Modal.Header closeButton>

          <Modal.Title>
            <FormGroup>
              Title
              <FormControl
                type="text"
                name="filename"
                value={this.state.filename}
                onChange={this.handleInputChange}
                />
            </FormGroup>
          </Modal.Title>

          <FormGroup>
            Description
            <FormControl
              type="text"
              name="description"
              value={this.state.description}
              onChange={this.handleInputChange}
              />
        </FormGroup>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            Content:
            <textarea
              style={{ height: '50vh', width: '100%' }} value={this.state.content}
              name='content'
              onChange={this.handleInputChange}/>
          </FormGroup>
        </Modal.Body>

        <Modal.Footer>
          <p>{ updatedText }</p>
          <Button
            bsStyle="info" disabled={!this.state.updateAllowed}
            onClick={this.updateGist}
            >
            Update
          </Button>
          <Button bsStyle={ starBtnStyle } onClick={this.toggleStar}>
            { starBtnText }
          </Button>
        </Modal.Footer>

      </div>
    )
  }
}

export default GistShow;
