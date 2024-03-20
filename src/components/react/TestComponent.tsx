import { useState } from "react"

export default () => {
    const [count, setCount] = useState(0);
    return <div>
        <p>hello world {count}</p>
        <button type="button" onClick={() => setCount(count + 1)}>click me</button>
        </div>
}