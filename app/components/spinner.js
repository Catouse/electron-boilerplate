import React, {Component} from 'react';
import Icon from 'Components/mdi';

class Spinner extends Component {
    render() {
        return <div className="spinner center-content fluid fluid-v text-center">
          <Icon name="loading" className="mdi-spin icon-2x text-gray"/>
        </div>
    }
}

export default Spinner;
