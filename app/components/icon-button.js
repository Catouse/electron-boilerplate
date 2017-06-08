import React, {Component} from 'react';
import Helper from 'Helper';
import Icon from 'Components/mdi';

class IconButton extends Component {

    static defaultProps = {
        enabled: true,
        label: '',
        icon: 'star',
        shortIcon: null,
        className: '',
        iconClass: 'rounded primary long-shadow',
        caret: false,
        iconStyle: null,
        labelStyle: null,
        shortIconStyle: null,
        style: null,
        onClick: null,
    };

    render() {
        let {
            enabled,
            label,
            icon,
            iconClass,
            className,
            caret,
            shortIcon,
            style,
            iconStyle,
            labelStyle,
            shortIconStyle,
            children,
            ...other
        } = this.props;

        let classNames = ['iconbutton'];
        if(className) classNames.push(className);
        if(!enabled) classNames.push('disabled');

        return <a {...other} className={classNames.join(' ')} style={Object.assign({padding: `${Helper.rem(5)} ${Helper.rem(10)} ${Helper.rem(2)} ${Helper.rem(10)}`}, style)}>
          <div className={`avatar avatar-lg ${iconClass}`} style={iconStyle}>
            <Icon className="icon icon-2x" name={icon}/>
            {shortIcon ? <Icon className="short-icon" name={shortIcon} style={shortIconStyle}/> : null}
          </div>
          <div className="title" style={Object.assign({textAlign: 'center', fontSize: Helper.rem(12), marginTop: Helper.rem(2), lineHeight: Helper.rem(16)}, labelStyle)}>{label}{caret ? <span className="caret"></span> : null}{children}</div>
        </a>;
    }
}

export default IconButton;
