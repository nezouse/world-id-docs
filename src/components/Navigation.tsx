import clsx from 'clsx'
import { Tag } from '@/components/Tag'
import { useRouter } from 'next/router'
import { remToPx } from '@/lib/remToPx'
import { Link } from '@/components/Link'
import { Button } from '@/components/Button'
import { FC, PropsWithChildren, useRef } from 'react'
import { useSectionStore } from '@/components/SectionProvider'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'

const useInitialValue = <T,>(value: T, condition = true): T => {
	let initialValue = useRef<T>(value).current
	return condition ? initialValue : value
}

const NavLink: FC<
	PropsWithChildren<{
		href: string
		tag?: 'get' | 'post' | 'put' | 'delete'
		active?: boolean
		isAnchorLink?: boolean
	}>
> = ({ href, tag, active, isAnchorLink = false, children }) => {
	return (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			className={clsx(
				'flex justify-between gap-2 py-1 pr-3 text-sm transition',
				isAnchorLink ? 'pl-7' : 'pl-4',
				active
					? 'text-zinc-900 dark:text-white font-medium'
					: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
			)}
		>
			<span className="truncate">{children}</span>
			{tag && (
				<Tag variant="medium" color="zinc">
					{tag}
				</Tag>
			)}
		</Link>
	)
}

const VisibleSectionHighlight: FC<{
	group: { title: string; links: { href: string }[] }
	pathname: string
}> = ({ group, pathname }) => {
	let [sections, visibleSections] = useInitialValue(
		[useSectionStore(s => s.sections), useSectionStore(s => s.visibleSections)],
		useIsInsideMobileNavigation()
	)

	let isPresent = useIsPresent()
	let firstVisibleSectionIndex = Math.max(
		0,
		[{ id: '_top' }, ...sections].findIndex(section => section.id === visibleSections[0])
	)
	let itemHeight = remToPx(2)
	let height = isPresent ? Math.max(1, visibleSections.length) * itemHeight : itemHeight
	let top = group.links.findIndex(link => link.href === pathname) * itemHeight + firstVisibleSectionIndex * itemHeight

	return (
		<motion.div
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.2 } }}
			exit={{ opacity: 0 }}
			className="bg-zinc-800/2.5 dark:bg-white/2.5 absolute inset-x-0 top-0 will-change-transform"
			style={{ borderRadius: 8, height, top }}
		/>
	)
}

const ActivePageMarker: FC<{
	pathname: string
	group: { title: string; links: { href: string }[] }
}> = ({ group, pathname }) => {
	let itemHeight = remToPx(2)
	let offset = remToPx(0.25)
	let activePageIndex = group.links.findIndex(link => link.href === pathname)
	let top = offset + activePageIndex * itemHeight

	return (
		<motion.div
			layout
			className="absolute left-2 h-6 w-px bg-primary"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.2 } }}
			exit={{ opacity: 0 }}
			style={{ top }}
		/>
	)
}

const NavigationGroup: FC<{
	group: { title: string; links: { href: string; title: string }[] }
	className?: string
}> = ({ group, className }) => {
	// If this is the mobile navigation then we always render the initial
	// state, so that the state does not change during the close animation.
	// The state will still update when we re-open (re-render) the navigation.
	let isInsideMobileNavigation = useIsInsideMobileNavigation()
	let [router, sections] = useInitialValue([useRouter(), useSectionStore(s => s.sections)], isInsideMobileNavigation)
	const pathname = router.pathname.replace('/api-docs', '/api')

	let isActiveGroup = group.links.findIndex(link => link.href === pathname) !== -1

	return (
		<li className={clsx('relative mt-6', className)}>
			<motion.h2 layout="position" className="text-zinc-900 dark:text-white text-xs font-semibold">
				{group.title}
			</motion.h2>
			<div className="relative mt-3 pl-2">
				<AnimatePresence initial={!isInsideMobileNavigation}>
					{isActiveGroup && <VisibleSectionHighlight group={group} pathname={pathname} />}
				</AnimatePresence>
				<motion.div layout className="bg-zinc-900/10 dark:bg-white/5 absolute inset-y-0 left-2 w-px" />
				<AnimatePresence initial={false}>
					{isActiveGroup && <ActivePageMarker group={group} pathname={pathname} />}
				</AnimatePresence>
				<ul role="list" className="border-transparent border-l">
					{group.links.map(link => (
						<motion.li key={link.href} layout="position" className="relative">
							<NavLink href={link.href} active={link.href === pathname}>
								{link.title}
							</NavLink>
							<AnimatePresence mode="popLayout" initial={false}>
								{link.href === pathname && sections.length > 0 && (
									<motion.ul
										role="list"
										initial={{ opacity: 0 }}
										animate={{
											opacity: 1,
											transition: { delay: 0.1 },
										}}
										exit={{
											opacity: 0,
											transition: { duration: 0.15 },
										}}
									>
										{sections.map(section => (
											<li key={section.id}>
												<NavLink
													href={`${link.href}#${section.id}`}
													tag={section.tag}
													isAnchorLink
												>
													{section.title}
												</NavLink>
											</li>
										))}
									</motion.ul>
								)}
							</AnimatePresence>
						</motion.li>
					))}
				</ul>
			</div>
		</li>
	)
}

export const navigation = [
	{
		title: 'Introduction',
		links: [
			{ title: 'World ID Overview', href: '/world-id' },
			{ title: 'Use Cases', href: '/use-cases' },
			{ title: 'Try it Out', href: '/try' },
			{ title: 'Quick Start', href: '/quick-start' },
		],
	},
	{
		title: 'World ID',
		links: [
			{ title: 'Verify with World ID', href: '/id/verify-with-world-id' },
			{ title: 'Sign in with World ID', href: '/id/sign-in' },
			{ title: 'Incognito Actions', href: '/id/incognito-actions' },
			{ title: 'Intro to IDKit', href: '/id/idkit' },
			{ title: 'Cloud Verification', href: '/id/cloud' },
			{ title: 'On-Chain Verification', href: '/id/on-chain' },
			{ title: 'Verification Levels', href: '/id/verification-levels' },
		],
	},
	{
		title: 'Technical Reference',
		links: [
			{ title: 'IDKit Reference', href: '/reference/idkit' },
			{ title: 'API Reference', href: '/reference/api' },
			{ title: 'Sign In Reference', href: '/reference/sign-in' },
			{ title: 'Smart Contracts', href: '/reference/contracts' },
			{ title: 'Address Book', href: '/reference/address-book' },
			{ title: 'Errors', href: '/reference/errors' },
			{ title: 'World ID 2.0 Migration Guide', href: '/reference/world-id-2-migration-guide' },
		],
	},
	{
		title: 'Further Reading',
		links: [
			{ title: 'OIDC Explainer', href: '/further-reading/oidc' },
			{ title: 'Protocol Internals', href: '/further-reading/protocol-internals' },
			{ title: 'Zero-Knowledge Proofs', href: '/further-reading/zero-knowledge-proofs' },
			{ title: 'World ID Reset', href: '/further-reading/world-id-reset' },
		],
	},
] as const

export const Navigation: FC<{
	className?: string
}> = props => {
	return (
		<nav {...props}>
			<ul role="list">
				{navigation.map((group, groupIndex) => (
					// @ts-ignore
					<NavigationGroup key={group.title} group={group} className={groupIndex === 0 && 'md:mt-0'} />
				))}
				<li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
					<Button href="https://developer.worldcoin.org" target="_blank" className="w-full">
						Developer Portal
					</Button>
				</li>
			</ul>
		</nav>
	)
}
