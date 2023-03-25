import { useSyncExternalStore } from 'react'
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
  const subscribed = new Set<Maple<any>>()

  function get<Target>(maple: Maple<Target>){
    let currentValue = maple.get()

    if (!subscribed.has(maple)) {
      subscribed.add(maple)
      maple.subscribe((newValue) => {
        if (currentValue === newValue) return
        currentValue = newValue
        computeValue()
      })
    }
    return currentValue
  }
  
  async function computeValue() {
    const newValue = typeof initialValue === "function" ? (initialValue as MapleGetter<MapleType>)(get) : value
    value = (null as MapleType)
    value = await newValue
    subscribers.forEach((callback) => callback(value))
  }

  computeValue()
  
  return {
    get: () => value,
    set: (newValue) => {
      value = newValue
      computeValue()
    },
    subscribe: (callback) => {
      subscribers.add(callback)
      return () => subscribers.delete(callback)
    },
    _subscribers: () => subscribers.size,
  }
}

export function useAtom<MapleType>(atom: Maple<MapleType>) {
  return [useSyncExternalStore(atom.subscribe, atom.get), atom.set];
}

export function useAtomValue<MapleType>(atom: Maple<MapleType>) {
  return useSyncExternalStore(atom.subscribe, atom.get);
}