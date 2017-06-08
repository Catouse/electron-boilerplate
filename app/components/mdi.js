import React, {Component} from 'react';
import Helper from 'Helper';

class MDIcon extends Component {
    static defaultProps = {
        size: 0,
        name: 'star',
        color: '',
        className: '',
        square: true
    };

    render() {
        let {
            square,
            size,
            color,
            name,
            style,
            children,
            className,
            ...other
        } = this.props;
        style = Object.assign({}, style);
        if(size) {
            if(size < 12) size *= 12;
            style.fontSize = Helper.rem(size);;
        }
        if(color) {
            style.color = color;
        }
        if(square && size) {
            style.lineHeight = style.fontSize;
            style.height = style.fontSize;
            style.width = style.fontSize;
        }
        return <i style={style} {...other} className={'mdi mdi-' + name + (className ? (' ' + className) : '')}>{children}</i>;
    }
}

export default MDIcon;
