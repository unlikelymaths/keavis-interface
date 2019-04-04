import React from "react";
import PropTypes from "prop-types";

import TopAppBar from '@material/react-top-app-bar';
import '@material/react-top-app-bar/dist/top-app-bar.css';
import MaterialIcon from '@material/react-material-icon';
import '@material/react-material-icon/dist/material-icon.css';

const TopBar = (props) => {
  let { switchDrawerOpenHandler } = props;
    
    return (<TopAppBar
        title='Miami, FL'
        navigationIcon={<MaterialIcon
          icon='menu'
          onClick={switchDrawerOpenHandler}
          />}      
        />);
};

TopBar.propTypes = {
  switchDrawerOpenHandler: PropTypes.func,
};

export default TopBar;




