# Neat-state


# Usage

1. set a state to the global store
```
import { neat } from 'neat-state'

const myValueNeat = neat(100)
``` 

2. get a value from the global store
```
import { neat } from 'neat-state'

const getMyValueNeat = neat((get) => get(myValue))
```

3. get a value from promise
```
import { neat } from 'neat-state'

const promiseDataNeat = neat(() => fetch('url-data').then((res) => res.json()))
```

4. use store within components
```
import { useNeat } from 'neat-state'

const [myValue, setMyValue] = useNeat(myValueNeat)

<>{myValue}</>