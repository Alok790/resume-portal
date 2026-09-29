import { useEffect, useRef } from 'react'

export default function usePolling(fetchFn, interval = 3000, stopCondition = () => false) {
  const stopRef = useRef(stopCondition)
  stopRef.current = stopCondition

  useEffect(() => {
    let timerId

    const poll = async () => {
      await fetchFn()
      if (!stopRef.current()) {
        timerId = setTimeout(poll, interval)
      }
    }

    poll()

    return () => clearTimeout(timerId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
