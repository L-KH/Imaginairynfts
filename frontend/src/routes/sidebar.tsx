import {
  BookOpenIcon,
  PhotographIcon ,
  CogIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
  VolumeUpIcon,
} from '@heroicons/react/outline'
import {
  TbBrandGithub,
  TbBrandTwitter,
  TbBrandDiscord,
  TbBrandMedium,
} from 'react-icons/tb'

interface INavigation {
  name: string
  href: string
  icon?: any
  current?: boolean
  checkActive?(pathname: String, route: INavigation): boolean
  exact?: boolean
}

interface IBottomNavigation {
  name: string
  href: string
  icon?: any
}

interface IBottomIcons {
  name: string
  href: string
  icon?: any
}

interface IBottomDisclaimer {
  name: string
  href: string
}

export function routeIsActive(pathname: String, route: INavigation): boolean {
  if (route.checkActive) {
    return route.checkActive(pathname, route)
  }

  return route?.exact
    ? pathname == route?.href
    : route?.href
    ? pathname.indexOf(route.href) === 0
    : false
}

const navigation: INavigation[] = [
  { name: 'Text to Image', href: '/', icon: HomeIcon, current: true, exact: true  },
  // {
  //   name: 'My NFTs',
  //   href: '/themePreview',
  //   icon: UsersIcon,
  //   current: false,
  // },
  {
    name: 'Minted NFTs',
    href: '/MintedNFT',
    icon: PhotographIcon,
    current: false,
  },
  // {
  //   name: 'Text to Music',
  //   href: '/MusicNFT',
  //   icon: VolumeUpIcon,
  //   current: false,
  // },
  {
    name: 'Gallery & Prompts',
    href: '/Gallery',
    icon: UsersIcon,
    current: false,
  },
  // { name: '404', href: '/404', icon: FolderIcon, current: false },
  // { name: '500', href: '/500', icon: CalendarIcon, current: false },
]

const bottomNavigation: IBottomNavigation[] = [
   { name: 'Documentation', href: 'https://l-kh.gitbook.io/imaginairy-nfts/', icon: BookOpenIcon },
  // { name: 'Settings', href: '#', icon: CogIcon },
]

const bottomIcons: IBottomIcons[] = [
  // {
  //   name: 'GitHub',
  //   href: 'https://github.com/JonnysCode/hardhat-nextjs-starter-dashboard',
  //   icon: TbBrandGithub,
  // },
  {
    name: 'Twitter',
    href: 'https://twitter.com/ImaginAIryNFTs',
    icon: TbBrandTwitter,
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/yRN5fNqFKM',
    icon: TbBrandDiscord,
  },
  {
    name: 'Medium',
    href: 'https://medium.com/@imaginairynfts',
    icon: TbBrandMedium,
  },
]
{bottomIcons.map((icon, i) => (
  <a key={i} href={icon.href} target="_blank" rel="noopener noreferrer">
    {icon.icon} {icon.name}
  </a>
))}
const bottomDisclaimer: IBottomDisclaimer[] = [
  { name: 'About', href: '/About' },
  { name: 'Privacy', href: '/Privacy' },
  { name: 'Terms', href: '/Terms' },
]

export function updateCurrentItem(route: INavigation) {
  navigation.map((item) => (item.current = false))
  route.current = true
}

export type { INavigation, IBottomNavigation }
export { bottomNavigation, bottomIcons, bottomDisclaimer }
export default navigation
