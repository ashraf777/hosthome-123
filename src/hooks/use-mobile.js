
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    // This function will only run on the client side
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkDevice()

    // Add resize listener
    window.addEventListener("resize", checkDevice)

    // Cleanup listener
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return isMobile
}
