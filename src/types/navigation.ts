export interface TabConfig {
  label: string
  path: string
  icon?: string
  disabled?: boolean
  description?: string
}

export interface NavigationTabsConfig {
  tabs: TabConfig[]
  variant?: 'pill' | 'link'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  orientation?: 'horizontal' | 'vertical'
}

// New types for drawer menu
export interface DrawerMenuItem {
  label: string
  path: string
  icon?: string
  disabled?: boolean
  description?: string
  children?: DrawerMenuItem[]
}

export interface DrawerMenuConfig {
  items: DrawerMenuItem[]
}
