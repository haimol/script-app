import React, { useEffect, useState } from 'react';
import {
    HomeOutlined,
    EditOutlined,
    FileTextOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    RocketOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Badge } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOutlineContext } from '../contexts/OutlineContext';

const { Sider } = Layout;

interface SideProps {
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
}

const Side: React.FC<SideProps> = ({ collapsed: controlledCollapsed, onCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hasValidOutlineData } = useOutlineContext();
    const [internalCollapsed, setInternalCollapsed] = useState(window.innerWidth < 1000);
    const [current, setCurrent] = useState('home');

    // Use controlled collapse state if provided, otherwise use internal state
    const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
    const setCollapsed = onCollapse || setInternalCollapsed;

    // Handle responsive collapse
    useEffect(() => {
        const handleResize = () => {
            const isNarrow = window.innerWidth < 1000;
            if (controlledCollapsed === undefined) {
                // Only auto-collapse on resize if not controlled externally
                setCollapsed(isNarrow);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [controlledCollapsed, setCollapsed]);

    // Update current selected item based on current route
    useEffect(() => {
        const path = location.pathname;
        if (path === '/') {
            setCurrent('home');
        } else if (path === '/outline') {
            setCurrent('outline');
        // DEMO: Episodes route detection commented out for client demo
        // } else if (path === '/episodes') {
        //     setCurrent('episodes');
        } else {
            setCurrent('home');
        }
    }, [location.pathname]);

    // Menu items configuration with a static structure
    const items: MenuProps['items'] = [
        {
            label: 'Home',
            key: 'home',
            icon: <HomeOutlined style={{ fontSize: 16, verticalAlign: 'middle', lineHeight: 1 }} />,
        },
        {
            type: 'divider',
            style: { 
                margin: '8px 16px',
                background: 'rgba(0, 0, 0, 0.04)'
            }
        },
        {
            label: 'Script Tools',
            key: 'tools',
            icon: <RocketOutlined style={{ fontSize: 16, verticalAlign: 'middle', lineHeight: 1 }} />,
            children: [
                {
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                            <span style={{ fontWeight: 500 }}>Outline Editor</span>
                            {hasValidOutlineData() && (
                                <CheckCircleOutlined style={{ 
                                    color: '#10b981', 
                                    fontSize: '12px',
                                    background: '#d1fae5',
                                    borderRadius: '50%',
                                    padding: '2px'
                                }} />
                            )}
                        </div>
                    ),
                    key: 'outline',
                    icon: <EditOutlined style={{ fontSize: 16, color: '#667eea' }} />,
                },
                // DEMO: Episode Manager commented out for client demo
                // {
                //     label: (
                //         <div style={{ 
                //             display: 'flex', 
                //             alignItems: 'center', 
                //             justifyContent: 'space-between',
                //             width: '100%'
                //         }}>
                //             <span style={{ fontWeight: 500 }}>Episode Manager</span>
                //             {hasValidOutlineData() && (
                //                 <Badge 
                //                     size="small" 
                //                     count="●" 
                //                     style={{ 
                //                         backgroundColor: '#10b981',
                //                         boxShadow: '0 0 0 2px #d1fae5'
                //                     }} 
                //                 />
                //             )}
                //         </div>
                //     ),
                //     key: 'episodes',
                //     icon: <FileTextOutlined style={{ fontSize: 16, color: '#10b981' }} />,
                // }
            ]
        },
        {
            type: 'divider',
            style: { 
                margin: '8px 16px',
                background: 'rgba(0, 0, 0, 0.04)'
            }
        },
        {
            label: 'Settings',
            key: 'settings',
            icon: <SettingOutlined style={{ fontSize: 16, color: '#6b7280' }} />,
        }
    ];

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
            // DEMO: Episodes navigation commented out for client demo
            // case 'episodes':
            //     navigate('/episodes');
            //     break;
            case 'settings':
                // TODO: Navigate to settings page when created
                console.log('Settings page - coming soon!');
                break;
            default:
                // Do nothing for the 'tools' key, it's a submenu
                if (e.key !== 'tools') {
                    navigate('/');
                }
        }
    };

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '2px 0 20px rgba(0, 0, 0, 0.08)',
                position: 'fixed',
                left: 0,
                top: '72px', // Start below the enhanced header
                bottom: 0,
                zIndex: 1000,
                height: 'calc(100vh - 72px)', // Full height minus header
                borderRight: '1px solid rgba(0, 0, 0, 0.06)',
                overflow: 'visible', // Allow trigger to overflow
            }}
            width={220}
            collapsedWidth={64}
            trigger={null} // Remove default trigger for custom styling
        >
            {/* Custom collapse trigger */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-16px', // Position button half outside the sider
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.5)',
                    border: '3px solid white',
                    zIndex: 1003,
                    transition: 'all 0.3s ease'
                }}
                onClick={() => setCollapsed(!collapsed)}
            >
                <span style={{ 
                    color: 'white', 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    lineHeight: '14px', // Center the arrow
                    transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.3s ease'
                }}>
                    ▶
                </span>
            </div>

            {/* Logo/Title area */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: collapsed ? "24px 0" : "28px 24px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                    marginBottom: "8px",
                    background: collapsed ? 'transparent' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: collapsed ? '0' : '0 0 16px 16px',
                    position: 'relative'
                }}
            >
                {!collapsed ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                        }}>
                            <RocketOutlined style={{ fontSize: '24px', color: 'white' }} />
                        </div>
                        <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #1a202c 0%, #4a5568 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: '4px'
                        }}>
                            Script Writer
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}>
                            AI-Powered Studio
                        </div>
                    </div>
                ) : (
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}>
                        <RocketOutlined style={{ fontSize: '18px', color: 'white' }} />
                    </div>
                )}
            </div>

            {/* Navigation menu */}
            <div style={{ 
                paddingBottom: collapsed ? '80px' : '120px',
                height: 'calc(100% - 140px)',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                <Menu
                    mode="inline"
                    inlineCollapsed={collapsed}
                    selectedKeys={[current]}
                    defaultOpenKeys={['tools']}
                    className="side-menu"
                    style={{ 
                        borderRight: 0,
                        background: 'transparent',
                        fontSize: '14px'
                    }}
                    items={items}
                    onClick={onClick}
                />
            </div>

            {/* Footer info - only show when not collapsed */}
            {!collapsed && (
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                    <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        color: '#4a5568',
                        marginBottom: '4px'
                    }}>
                        Script Writer v1.0
                    </div>
                    <div style={{ 
                        fontSize: '11px',
                        color: '#6b7280',
                        letterSpacing: '0.3px'
                    }}>
                        Tsinghua University
                    </div>

                </div>
            )}
        </Sider>
    );
};

export default Side; 