import React, {Component} from 'react';
import TopAppBar, {TopAppBarFixedAdjust} from '@material/react-top-app-bar';
import Drawer, {DrawerAppContent, DrawerContent, DrawerHeader, DrawerTitle, DrawerSubtitle} from '@material/react-drawer';
import MaterialIcon from '@material/react-material-icon';
import List, {ListItem, ListItemGraphic, ListItemText} from '@material/react-list';

import './frame.scss';

//var FrameContent = DrawerAppContent;

function FrameContent(props) {
    return <DrawerAppContent className='frame-content'>
        {props.children}
    </DrawerAppContent>
}

class Frame extends React.Component {
    constructor(props) {
        super(props);
        this.modalSwitch = 400 + 400 + 250; //rightSheet + mainContent + Drawer
        this.drawerClosedByUser = false
        this.state = {
            drawerModal: window.innerWidth < this.modalSwitch,
            drawerOpen: window.innerWidth >= this.modalSwitch
            };
    }
    
    switchDrawerOpen() {
        if (!this.state.drawerModal)
            this.drawerClosedByUser = this.state.drawerOpen
        this.setState({
            drawerOpen: !this.state.drawerOpen
            });
    }
    
    handleWindowSizeChange() {
        if (this.state.drawerModal) 
        {
            if (window.innerWidth >= this.modalSwitch)
            {
                if (this.state.drawerOpen)
                {
                    this.drawerClosedByUser = false
                }
                this.setState({ 
                    drawerOpen: !this.drawerClosedByUser,
                    drawerModal: false
                    });
            }
        }
        else
        {
            if (window.innerWidth < this.modalSwitch)
                this.setState({ 
                    drawerOpen: false, 
                    drawerModal: true
                    });
        }
        
    };
    
    componentWillMount() {
        window.addEventListener('resize', this.handleWindowSizeChange.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }
    
    render() {
        
        return (
        <div className='frame'>
            <TopAppBar 
              title={this.props.title}
              navigationIcon={<MaterialIcon
                icon='menu'
                onClick={this.switchDrawerOpen.bind(this)}/>}
              actionItems={[<MaterialIcon key='item' icon='bookmark' />]}
              />
    
            <TopAppBarFixedAdjust >
            <Drawer
              modal={this.state.drawerModal}
              dismissible={!this.state.drawerModal}
              open={this.state.drawerOpen}>
                  {<DrawerHeader>
                <DrawerTitle tag='h3'>
                    KeaVis
                </DrawerTitle>
                  </DrawerHeader>}
    
                <DrawerContent style={{margin: '10px'}}>
                <List singleSelection 
                    selectedIndex={0}
                    handleSelect={this.props.handleSelect}>
                    <DrawerSubtitle>
                      Popular Topics
                    </DrawerSubtitle>
                    <ListItem>
                    <ListItemGraphic graphic={<MaterialIcon icon='whatshot'/>}/>
                    <ListItemText primaryText='Hot' />
                    </ListItem>
                    <ListItem>
                    <ListItemGraphic graphic={<MaterialIcon icon='star'/>}/>
                    <ListItemText primaryText='Trending' />
                    </ListItem>
                    <ListItem>
                    <ListItemGraphic graphic={<MaterialIcon icon='new_releases'/>}/>
                    <ListItemText primaryText='New' />
                    </ListItem>
                    
                    <DrawerSubtitle>
                      Topic Detail
                    </DrawerSubtitle>
                    <ListItem>
                    <ListItemGraphic graphic={<MaterialIcon icon='bar_chart'/>}/>
                    <ListItemText primaryText='Overview' />
                    </ListItem>
                    <ListItem>
                    <ListItemGraphic graphic={<MaterialIcon icon='insert_chart'/>}/>
                    <ListItemText primaryText='Evolution' />
                    </ListItem>
                    <ListItem>
                    <ListItemGraphic graphic={<MaterialIcon icon='message'/>}/>
                    <ListItemText primaryText='Tweets' />
                    </ListItem>
                    
                    <DrawerSubtitle>
                      Information
                    </DrawerSubtitle>
                    <ListItem>
                    <ListItemGraphic graphic={<MaterialIcon icon='info'/>}/>
                    <ListItemText primaryText='About' />
                    </ListItem>
                </List>
                <div className='drawer-buffer'>
                </div>
                </DrawerContent>
            </Drawer>
    
            {this.props.children}
            </TopAppBarFixedAdjust>
        </div>
        );
    }
}

export default Frame;
export {FrameContent};
