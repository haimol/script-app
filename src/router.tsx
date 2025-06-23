import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './router.css';



import {Layout} from "antd";
import MainFramework from './Menu/Menu';


const AppRouter: React.FC = () => {

    return (
        <Router>

            <Layout>
                <MainFramework/>
            </Layout>
        </Router>
    );
};

export default AppRouter;
