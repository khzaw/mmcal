import React from 'react';
import compose from 'recompose/compose';
import setPropTypes from 'recompose/setPropTypes';
import setStatic from 'recompose/setStatic';
import moment from 'moment';

const enhance = compose(
  setPropTypes({

  }),
  setStatic('defaultProps', {

 })
);

export default enhance(({ day }) => (
  <div className="day">
    <h3 className="label">{day}</h3>
  </div>
));