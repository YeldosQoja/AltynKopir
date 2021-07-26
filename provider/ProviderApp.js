import React, { Component, createContext } from 'react';
import { ColorApp } from '../theme/color/ColorApp';

const StateContext = createContext();

class ProviderApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstStartApp: true,
            token: false,
            exit: false,
            user: null,
            bottomBar: null,
            isReload: true
        };
    }

    reload = () => {
        this.setState({});
    }

    setFirstStartApp = (firstStartApp) => {
        this.setState({ firstStartApp });
    }

    setToken = (token) => {
        this.setState({ token });
    }

    setExit = (exit) => {
        this.setState({ exit });
    }

    setIsReload = (isReload) => {
        this.setState({ isReload });
    }

    setUser = (user) => {
        this.setState({ user });
    }

    setBottomBar = (bottomBar) => {
        this.setState({ bottomBar });
    }

    render() {
        return (
            <StateContext.Provider
                value={{
                    firstStartApp: this.state.firstStartApp,
                    setFirstStartApp: this.setFirstStartApp,
                    token: this.state.token,
                    setToken: this.setToken,
                    exit: this.state.exit,
                    setExit: this.setExit,
                    reload: this.reload,
                    user: this.state.user,
                    setUser: this.setUser,
                    bottomBar: this.state.bottomBar,
                    setBottomBar: this.setBottomBar,
                    isReload: this.state.isReload,
                    setIsReload: this.setIsReload
                }}
            >
                {
                    this.props.children
                }
            </StateContext.Provider>
        );
    }
}

export { ProviderApp, StateContext };
