import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean
) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback(
    (node: Element | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) callback()
      })
      if (node) observerRef.current.observe(node)
    },
    [callback, hasMore]
  )

  return lastElementRef
}
