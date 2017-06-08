import React, {Component} from 'react';
import Helper from 'Helper';
import Icon from 'Components/mdi';


class Panel extends Component {

    static defaultProps = {
        heading: '',
        headingStyle: null,
        expand: true,
        navs: null,
        contentClass: '',
        expandIconName: 'plus',
        headingClass: '',
        collapseIconName: 'minus',
        clickHeaderToExpand: true,
        content: '',
        onExpand: null,
    };

    constructor(props) {
        super(props);
        this.state = {expand: this.props.expand}
        this.handleExpandClassClick = this.handleExpandClassClick.bind(this);
    }

    handleExpandClassClick() {
        let newExpand = !this.state.expand;
        this.setState({expand: newExpand});
        this.props.onExpand && this.props.onExpand(newExpand);
    }

    render() {
        let {
            heading,
            headingStyle,
            expand,
            navs,
            contentClass,
            expandIconName,
            headingClass,
            collapseIconName,
            content,
            className,
            children,
            onExpand,
            clickHeaderToExpand,
            ...other
        } = this.props;

        let classNames = ['panel'], contentClasses = ['content'];
        if(className) classNames.push(className);
        if(contentClass) contentClasses.push(contentClass);
        if(!this.state.expand) {
            contentClasses.push('hidden');
            classNames.push('collapsed');
        }

        return <div {...other} className={classNames.join(' ')}>
          <div className={'heading ' + (headingClass || '')} style={headingStyle} onClick={clickHeaderToExpand ? this.handleExpandClassClick : null}>
            <span className="title">{heading}</span>
            {navs ? <nav className="nav nav-sm">{navs}</nav> : null}
            <nav className="nav nav-sm"><a onClick={clickHeaderToExpand ? null : this.handleExpandClassClick}><Icon className="icon-hx" name={this.state.expand ? collapseIconName : expandIconName}/></a></nav>
          </div>
          <div className={contentClasses.join(' ')}>
          {content}
          {children}
          </div>
        </div>;
    }
}

export default Panel;
