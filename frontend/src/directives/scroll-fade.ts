function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0
  )
}

const scrollFade = {
  mounted(el: HTMLElement) {
    const onScroll = () => {
      if (isInViewport(el)) {
        el.classList.add('is-visible')
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll)
    // Initial check
    onScroll()
  }
}

export default scrollFade
