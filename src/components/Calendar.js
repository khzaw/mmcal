import React from 'react';
import pure from 'recompose/pure';
import setPropTypes from 'recompose/setPropTypes';
import setStatic from 'recompose/setStatic';
import compose from 'recompose/compose';
import moment from 'moment';
import Day from './Day';

const enhance = compose(
  pure,
  setPropTypes({

  }),
  setStatic('defaultProps', {

  })
);

const createDays = (now) => {
  let days = [];
  for (let i = 1; i <= now.daysInMonth(); i++) {
    days.push(<Day day={i} key={i} />);
  }
  return days;
};

const now = moment();



export default enhance(({ }) => (
  <main className="calendar">
    <div className="week">
      <div className="weekday">Sunday</div>
      <div className="weekday">Monday</div>
      <div className="weekday">Tuesday</div>
      <div className="weekday">Wednesday</div>
      <div className="weekday">Thursday</div>
      <div className="weekday">Friday</div>
      <div className="weekday">Saturday</div>
    </div>
    <div className="week">
      {createDays(moment())}
    </div>
  </main>
));