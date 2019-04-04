import React from "react";
import PropTypes from "prop-types";

import Drawer, {DrawerHeader,DrawerSubtitle,DrawerTitle,DrawerContent,} from '@material/react-drawer';
import "@material/react-drawer/dist/drawer.css";
import List, {ListItem, ListItemText, ListItemGraphic} from '@material/react-list';
import "@material/react-list/dist/list.css";
import MaterialIcon from '@material/react-material-icon';
import '@material/react-material-icon/dist/material-icon.css';

class LeftDrawer extends React.Component {
    constructor(props) {
        super(props);
    }
    
    handleClickAway() {
        console.log("Click away");
    }
    
    render() {
        return (<Drawer
          modal
          open={this.props.drawerOpen}>
            <DrawerHeader>
                <DrawerTitle tag='h2'>
                    Inbox
                </DrawerTitle>
                <DrawerSubtitle>
                    matt@email.com
                </DrawerSubtitle>
            </DrawerHeader>
            <DrawerContent tag='main'> 
                <List>
                    <ListItem>
                        <ListItemText primaryText='Photos'/>
                    </ListItem>
                    <ListItem>
                        <ListItemText primaryText='Recipes'/>
                    </ListItem>
                    <ListItem>
                        <ListItemGraphic graphic={<MaterialIcon icon='folder'/>} />
                        <ListItemText primaryText='Work'/>
                    </ListItem>
                </List>
            </DrawerContent>
        </Drawer>)
    }
}

LeftDrawer.propTypes = {
  drawerOpen: PropTypes.bool,
};

export default LeftDrawer;