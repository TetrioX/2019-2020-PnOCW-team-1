//https://github.com/desicochrane/delaunay/blob/master/src/LinkedCycle.js
//An implementation of a double linked cyclic list

function linkedList(){

    const model = {
        length: 0,
        first: null,
        nodes: {},
    }

    function Length(){
        return model.length
    }

    function Get(item){
        return model.nodes[item]
    }

    function First(){
        return model.first
    }

    function SetFirst(node){
        model.first = node
    }

    function InsertBefore(next, key, val){
        const prev = next.prev
        const node = {key, val, next, prev}

        model.nodes[key] = node
        model.length += 1
        prev.next = node
        next.prev = node
    }

    function Append(key, val){
        if (model.first !== null) {
            return InsertBefore(model.first, key, val)
        }

        const node = { key, val }
        node.prev = node
        node.next = node

        model.first = node

        model.nodes[key] = node
        model.length += 1
    }
    function Remove(item) {
        const node = Get(item)
        if (typeof node === 'undefined') return

        model.length--
        delete(model.nodes[item])

        if (model.length === 0) {
            model.first = null
            node.next = null
            node.prev = null
            return
        }

        const before = node.prev
        const after = node.next
        node.next = null
        node.prev = null

        before.next = after
        after.prev = before

        if (node === model.first) {
            model.first = after
        }
    }

    function ToArray() {
        const arr = Array(model.length)

        if (model.length === 0) arr

        let n = model.first
        for (let i = 0; i < model.length; i++) {
            arr[i] = n.val
            n = n.next
        }
        return arr
    }

    return { model, Length, Get, First, SetFirst, Append, InsertBefore, Remove, ToArray }
}
export default linkedList