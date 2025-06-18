import React, { useEffect, useState } from 'react';
import {
    HomeOutlined,
    EditOutlined,
    FileTextOutlined,
    SettingOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Side: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1000);
    const [current, setCurrent] = useState('home');

    // Handle responsive collapse
    useEffect(() => {
        const handleResize = () => {
            const isNarrow = window.innerWidth < 1000;
            setCollapsed(isNarrow);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Update current selected item based on current route
    useEffect(() => {
        const path = location.pathname;
        if (path === '/') {
            setCurrent('home');
        } else if (path === '/outline') {
            setCurrent('outline');
        } else {
            setCurrent('home');
        }
    }, [location.pathname]);

    // Menu items configuration
    const items: MenuProps['items'] = [
        {
            label: 'Home',
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: 'Script Tools',
            key: 'tools',
            icon: <FileTextOutlined />,
            children: [
                {
                    label: 'Outline Editor',
                    key: 'outline',
                    icon: <EditOutlined />,
                },
                // TODO: Add more script tools here as you develop them
                // {
                //     label: 'Character Builder',
                //     key: 'characters',
                //     icon: <UserOutlined />,
                // },
                // {
                //     label: 'Scene Generator',
                //     key: 'scenes',
                //     icon: <VideoCameraOutlined />,
                // },
            ],
        },
        {
            label: 'Settings',
            key: 'settings',
            icon: <SettingOutlined />,
        },
    ];

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Handle menu item clicks
    const onClick: MenuProps['onClick'] = (e) => {
        console.log('Navigation click:', e);
        setCurrent(e.key);
        
        // Navigation logic
        switch (e.key) {
            case 'home':
                navigate('/');
                break;
            case 'outline':
                navigate('/outline');
                break;
            case 'settings':
                // TODO: Navigate to settings page when created
                console.log('Settings page - coming soon!');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{ 
                background: colorBgContainer,
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                position: 'fixed',
                left: 0,
                top: '64px', // Start below the header (typical Ant Design header height)
                bottom: 0,
                zIndex: 1000,
                height: 'calc(100vh - 64px)', // Full height minus header
                overflow: 'auto'
            }}
        >
            {/* Logo/Title area */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: collapsed ? "2em 0" : "2em 1em",
                    borderBottom: "1px solid #f0f0f0",
                    marginBottom: "1em"
                }}
                className="logo-holder"
            >
                {!collapsed ? (
                    <div style={{ textAlign: 'center' }}>
                        <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold', 
                            color: '#333',
                            marginTop: '8px' 
                        }}>
                            Script Writer
                        </div>
                    </div>
                ) : (
                    <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                )}
            </div>

            {/* Navigation menu */}
            <Menu
                mode="inline"
                selectedKeys={[current]}
                defaultOpenKeys={['tools']} // Keep tools section open by default
                style={{ 
                    borderRight: 0,
                    background: 'transparent'
                }}
                items={items}
                onClick={onClick}
            />

            {/* Footer info - only show when not collapsed */}
            {!collapsed && (
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#8c8c8c'
                }}>
                    <div>Script Writer v1.0</div>
                    <div style={{ marginTop: '4px' }}>
                        Tsinghua University
                    </div>
                </div>
            )}
        </Sider>
    );
};

export default Side; 