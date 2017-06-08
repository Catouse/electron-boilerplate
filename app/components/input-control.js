import React, {Component} from 'react';
import Helper from 'Helper';

class InputControl extends Component {

    static defaultProps = {
        label: '',
        placeholder: '',
        autoFocus: false,
        style: null,
        name: Helper.uuid,
        type: 'text',
        defaultValue: '',
        helpText: null,
        onChange: null
    };

    constructor(props) {
        super(props);
        this.state = {value: this.props.defaultValue};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.onChange && this.props.onChange(event.target.value);
    }

    componentDidMount() {
        if(this.props.autoFocus) {
            this.autoFocusTask = setTimeout(() => {
                this.control.focus();
            }, 100);
        }
    }

    componentWillUnmount() {
        if(this.autoFocusTask) {
            clearTimeout(this.autoFocusTask);
        }
    }

    render() {
        let {
            label,
            placeholder,
            autoFocus,
            style,
            name,
            type,
            defaultValue,
            helpText,
            onChange,
            ...other
        } = this.props;

        return <div className="control" style={style} {...other}>
          <label htmlFor={name}>{label}</label>
          <input ref={e => {this.control = e}} value={this.state.value} name={name} type={type} className="input rounded" placeholder={placeholder} onChange={this.handleChange}/>
          {helpText ? <p className="help-text">helpText</p> : null}
        </div>;
    }
}

export default InputControl;
