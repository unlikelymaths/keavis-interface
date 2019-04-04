import React from 'react';
import ReactDOM from 'react-dom';
import KeavisApp from './KeavisApp';

import './overrides.scss';
import './base.scss';

const wrapper = document.getElementById('app');
wrapper ? ReactDOM.render(<KeavisApp />, wrapper) : null;