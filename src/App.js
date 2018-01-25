import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import GistItem from './GistItem';
import GistShow from './GistShow';
import { Button, Modal, DropdownButton, MenuItem } from 'react-bootstrap';

class App extends Component {
  constructor() {
    super();
    this.state = {
      gists: [],
      privacy: 'both',
      isModalOpen: false,
      openedGist: null,
      dropdownTitle: 'Recently created'
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getGists = this.getGists.bind(this);
    this.dropdownSelect = this.dropdownSelect.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
  }

  openModal(gist) {
    this.setState({ isModalOpen: true, openedGist: gist });
  }

  closeModal() {
    this.setState({ isModalOpen: false });
  }

  dropdownSelect(title) {
    this.setState({ dropdownTitle: title });
  }

  getGists() {
    axios.get('https://api.github.com/users/digital-promise-test/gists', {
      params: {
        'access_token': process.env.REACT_APP_TOKEN,
         // date avoids reloading cached data
        'date': Date.now()
      }
    })
    .then( response => {
      this.setState({ gists: response.data })
    })
    .catch( error => {
      console.log(error);
    });
  }

  handleOptionChange(e) {
    this.setState({ privacy: e.target.value});
  }

  render() {
    const privacyFilteredGists = this.state.gists.filter(gist => {
      if (this.state.privacy === 'both') {
        return true;
      } else if (this.state.privacy === 'public') {
        return gist.public === true;
      } else if (this.state.privacy === 'private') {
        return gist.public === false;
      } else {
        return '';
      }
    });

    const { dropdownTitle } = this.state;

    const gists = privacyFilteredGists
      .sort( (a,b) => {
        if (dropdownTitle === 'Recently created') {
          return Date.parse(b.created_at) - Date.parse(a.created_at);
        } else if (dropdownTitle === 'Least recently created') {
          return Date.parse(a.created_at) - Date.parse(b.created_at);
        } else if (dropdownTitle === 'Recently updated') {
          return Date.parse(b.updated_at) - Date.parse(a.updated_at);
        } else {
          return Date.parse(a.updated_at) - Date.parse(b.updated_at);
        }
      })
      .map( gist => (
        <GistItem
          key={ gist.id }
          gist={ gist }
          openModal={this.openModal}
          closeModal={this.closeModal}
        />
      ));

    return (
      <div className="App">

        <div className="bar">

          <Button bsStyle="success" onClick={this.getGists}>
            Get Gists!
          </Button>

          <span className='settings'>

            <label>
              <input type="radio" value="both"
                     checked={this.state.privacy === 'both'}
                     onChange={this.handleOptionChange}
              />
              Both
            </label>
            <label>
              <input type="radio" value="public"
                     checked={this.state.privacy === 'public'}
                     onChange={this.handleOptionChange}
              />
              Public Only
            </label>
            <label>
              <input type="radio" value="private"
                     checked={this.state.privacy === 'private'}
                     onChange={this.handleOptionChange}
              />
              Private Only
            </label>

            <DropdownButton
              title={`Sort: ${this.state.dropdownTitle}`}
              id='dropdown'
              >
              <MenuItem eventKey="Recently created"
                onSelect={this.dropdownSelect}
                >
                Recently created
              </MenuItem>
              <MenuItem eventKey="Least recently created"
                onSelect={this.dropdownSelect}
                >
                Least recently created
              </MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="Recently updated"
                onSelect={this.dropdownSelect}
                >
                Recently Updated
              </MenuItem>
              <MenuItem eventKey="Least recently updated"
                onSelect={this.dropdownSelect}
                >
                Least recently updated
              </MenuItem>
            </DropdownButton>

          </span>

        </div>

        <ul className='gist-list'>
          { gists }
        </ul>

        <Modal
          show={this.state.isModalOpen}
          onHide={() => this.closeModal()}
          onExit={() => this.closeModal()}
          >
          <GistShow refresh={this.getGists} gist={this.state.openedGist}/>
        </Modal>

      </div>
    );
  }
}

export default App;
