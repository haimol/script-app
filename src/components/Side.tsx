import React, { useEffect, useState } from 'react';
import {
    HomeOutlined,
    EditOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    RocketOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Badge, Modal } from 'antd';
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
    
    // Navigation confirmation state
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    // Check if we're currently on episodes page and might have unsaved data
    const isOnEpisodesPage = location.pathname === '/episodes';
    
    // Simple heuristic to check if user might have episode data
    // (We can't access episode state from here, so we use a basic check)
    const mightHaveEpisodeData = () => {
        return isOnEpisodesPage && hasValidOutlineData();
    };

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
        } else if (path === '/episodes') {
            setCurrent('episodes');
        } else {
            setCurrent('home');
        }
    }, [location.pathname]);

    // Menu items configuration with a static structure
    const items: MenuProps['items'] = [
        {
            label: '首页',
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
            label: '剧本工具',
            key: 'tools',
            icon: <RocketOutlined style={{ fontSize: 16, verticalAlign: 'middle', lineHeight: 1 }} />,
            children: [
                {
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%',
                            minWidth: 0 // Allow flex item to shrink
                        }}>
                            <span style={{ 
                                fontWeight: 500,
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginRight: '8px'
                            }}>
                                大纲编辑器
                            </span>
                            {hasValidOutlineData() && (
                                <CheckCircleOutlined style={{ 
                                    color: '#10b981', 
                                    fontSize: '12px',
                                    background: '#d1fae5',
                                    borderRadius: '50%',
                                    padding: '2px',
                                    flexShrink: 0
                                }} />
                            )}
                        </div>
                    ),
                    key: 'outline',
                    icon: <EditOutlined style={{ fontSize: 16, color: '#667eea' }} />,
                },
                {
                    label: (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            width: '100%',
                            minWidth: 0 // Allow flex item to shrink
                        }}>
                            <span style={{ 
                                fontWeight: 500,
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginRight: '8px'
                            }}>
                                剧集管理器
                            </span>
                            {hasValidOutlineData() && (
                                <Badge 
                                    size="small" 
                                    count="●" 
                                    style={{ 
                                        backgroundColor: '#10b981',
                                        boxShadow: '0 0 0 2px #d1fae5'
                                    }}
                                />
                            )}
                        </div>
                    ),
                    key: 'episodes',
                    icon: <FileTextOutlined style={{ fontSize: 16, color: '#10b981' }} />,
                }
            ]
        }
    ];

    // Navigation confirmation handlers
    const handleConfirmExit = () => {
        setShowExitConfirm(false);
        if (pendingNavigation) {
            navigate(pendingNavigation);
            setPendingNavigation(null);
        }
    };

    const handleCancelExit = () => {
        setShowExitConfirm(false);
        setPendingNavigation(null);
    };

    // Safe navigation function
    const navigateWithConfirmation = (path: string, menuKey: string) => {
        if (isOnEpisodesPage && mightHaveEpisodeData() && path !== '/episodes') {
            setPendingNavigation(path);
            setShowExitConfirm(true);
        } else {
            setCurrent(menuKey);
            navigate(path);
        }
    };

    // Handle menu item clicks
    const onClick: MenuProps['onClick'] = (e) => {
        console.log('Navigation click:', e);
        
        // Navigation logic
        switch (e.key) {
            case 'home':
                navigateWithConfirmation('/', e.key);
                break;
            case 'outline':
                navigateWithConfirmation('/outline', e.key);
                break;
            case 'episodes':
                navigateWithConfirmation('/episodes', e.key);
                break;
            default:
                // Do nothing for the 'tools' key, it's a submenu
                if (e.key !== 'tools') {
                    navigateWithConfirmation('/', 'home');
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
                            剧本编写器
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}>
                            AI驱动工作室
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
                        剧本编写器 v1.0
                    </div>
                    <div style={{ 
                        fontSize: '11px',
                        color: '#6b7280',
                        letterSpacing: '0.3px'
                    }}>
                        Script Generator
                    </div>

                </div>
            )}

            {/* Exit Confirmation Modal */}
            <Modal
                title={
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        color: '#faad14'
                    }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <span style={{ fontWeight: 600, fontSize: '16px' }}>确认离开剧集页面</span>
                    </div>
                }
                open={showExitConfirm}
                onOk={handleConfirmExit}
                onCancel={handleCancelExit}
                okText="确认离开"
                cancelText="继续编辑"
                okType="danger"
                width={480}
                centered
                maskClosable={false}
                closeIcon={null}
                bodyStyle={{ 
                    padding: '20px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                }}
                okButtonProps={{
                    size: 'large',
                    style: {
                        color: '#ffffff',
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f',
                        fontWeight: 600
                    }
                }}
                cancelButtonProps={{
                    size: 'large',
                    style: {
                        fontWeight: 600
                    }
                }}
            >
                <div style={{ color: '#4a5568' }}>
                    <p style={{ marginBottom: '16px', fontWeight: 500 }}>
                        您在剧集页面可能有未保存的内容：
                    </p>
                    
                    <div style={{ 
                        background: '#fff7ed', 
                        border: '1px solid #fed7aa',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '16px'
                    }}>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: '#9a3412' }}>
                            <li>剧集大纲编辑内容</li>
                            <li>AI 对话记录</li>
                            <li>已生成的剧本</li>
                        </ul>
                    </div>

                    <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                        离开后这些数据将丢失，确定要继续吗？
                    </p>
                </div>
            </Modal>
        </Sider>
    );
};

export default Side; 