import { useSyncExternalStore } from 'react'

type Neat<NeatType> = { 
  get: () => NeatType
  set: (newValue: NeatType) => void
  subscribe: (callback: (newValue: NeatType) => void) => () => void
  _subscribers: () => number
}

type NeatGetter<NeatType> = (
  get: <Target>(m: Neat<Target>) => Target,
) => NeatType

export function neat<NeatType>(
  initialValue: NeatType | NeatGetter<NeatType>,
) : Neat<NeatType> {
  let value: NeatType = typeof initialValue === "function" ? (null as NeatType) : initialValue
  
  const subscribers = new Set<(newValue: NeatType) => void>()
  const subscribed = new Set<Neat<any>>()

  function get<Target>(neat: Neat<Target>){
    let currentValue = neat.get()

    if (!subscribed.has(neat)) {
      subscribed.add(neat)
      neat.subscribe((newValue) => {
        if (currentValue === newValue) return
        currentValue = newValue
        computeValue()
      })
    }
    return currentValue
  }
  
  async function computeValue() {
    const newValue = typeof initialValue === "function" ? (initialValue as NeatGetter<NeatType>)(get) : value
    value = (null as NeatType)
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

export function useNeat<NeatType>(neat: Neat<NeatType>) {
  return [useSyncExternalStore(neat.subscribe, neat.get), neat.set];
}

export function useNeatValue<NeatType>(neat: Neat<NeatType>) {
  return useSyncExternalStore(neat.subscribe, neat.get);
}