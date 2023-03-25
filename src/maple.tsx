
type Maple<MapleType> = {
  get: () => MapleType
  set: (newValue: MapleType) => void
  subscribe: (callback: (newValue: MapleType) => void) => () => void
  _subscribers: () => number
}

type MapleGetter<MapleType> = (
  get: <Target>(m: Maple<Target>) => Target,
) => MapleType

export function maple<MapleType>(
  initialValue: MapleType | MapleGetter<MapleType>,
) : Maple<MapleType> {
  let value: MapleType = typeof initialValue === "function" ? (null as MapleType) : initialValue
  
  const subscribers = new Set<(newValue: MapleType) => void>()

  return {
    get() {
      return value
    },
    set(newValue) {
      value = newValue
      subscribers.forEach((callback) => callback(value))
    },
    subscribe(callback) {
      subscribers.add(callback)
      return () => {
        subscribers.delete(callback)
      }
    },
    _subscribers() {
      return subscribers.size
    },
  }
}