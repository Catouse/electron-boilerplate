import React               from 'react';
import Moment              from 'moment';
import {Lang}              from 'Lang';

const TimeSpan = React.createClass({
    render() {
        let {
            begin,
            end,
            ...other
        } = this.props;

        begin = Moment(begin);
        end = Moment(end);

        let timespanDesc = begin.format(Lang.time.format.fullDate);
        if(!begin.isSame(end, 'day')) {
            timespanDesc += ' ~ ' + end.format(Lang.time.format[end.isSame(begin, 'year') ? 'monthDay' : 'fullDate']);
        }

        return <span {...other}>{timespanDesc}</span>
    }
});

export default TimeSpan;
