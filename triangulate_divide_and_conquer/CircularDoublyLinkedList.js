//https://humanwhocodes.com/blog/2019/03/computer-science-in-javascript-circular-doubly-linked-lists/

const geometry = require('./geometry');
const triangulate = require('./triangulate')


const head = Symbol("Head");

class CircularDoublyLinkedListNode{
    constructor(data){
        this.data = data;
        this.next = null;
        this.previous = null;
    }
}

class CircularDoublyLinkedList{

    constructor() {
        this[head] = null;
    }

    add(data){
        const newNode = new CircularDoublyLinkedListNode(data);

        //if no items in list yet
        if (this[head] === null){
            this[head] = newNode;
            newNode.next = newNode;
            newNode.previous = newNode;
        } else {
            const tail = this[head].previous;

            tail.next = newNode;
            newNode.previous = tail;
            newNode.next = this[head];
            this[head].previous = newNode;
        }
    }

    get(index){
        //Make sure list is not empty and index is a positive value
        if((index > -1) && (this[head]!== null)){

            let current = this[head];
            let i = 0;

            do {
                if( i === index){
                    return current.data;
                }
                current = current.next;
                i++;
            } while ((current !== this[head]) && (i <= index));
            return undefined
        }
    }

    remove(index){
        //special case: empty list
        if ((this[head] === null) || (index < 0)){
            throw new RangeError('index does not exist in the list');
        }

        let current = this[head];

        //special case: removing first node
        if (index === 0){
            //only node in list
            if(current.next == this[head]){
                this[head] = null;
            } else{
                const tail = this[head].previous;
                tail.next = current.next;
                current.next.previous = tail;
                this[head] = tail.next;
            }
            return current.data;
        }
        let i = 0;
        do {
            current = current.next;
            i++;
        } while ((current !== this[head]) && (i < index));

        if(current !== this[head]){
            current.previous.next = current.next;
            current.next.previous = current.previous;
            return current.data;
        }
        //index not in list
        throw new RangeError('index is not found in list')

    }

    removeElement(data){
        let i = this.indexOf(data)
        this.remove(i)
    }
    indexOf(data) {

        if (this[head] === null) {
            return -1;
        }
        let current = this[head];
        let index = 0;

        do {

            if (current.data === data) {
                return index;
            }
            current = current.next;
            index++;

        } while (current !== this[head]);


        return -1;
    }
    getLength() {

        if(this[head] === null){
            return 0;
        } else {
            let i = 0;
            let current = this[head];

            do {
                current = current.next;
                i++;
            } while( current !== this[head])
            return i;
        }
}
    insert(data, index) {

        const newNode = new CircularDoublyLinkedListNode(data);
        if (this[head] === null) {
            throw new RangeError(`Index ${index} does not exist in the list.`);
        }

        let current = this[head];

        // special case: insert after index 0 doesn't require a traversal
        if (index > 0) {

            let i = 0;

            do {
                current = current.next;
                i++;
            } while ((current !== this[head]) && (i < index));

            if (i < index) {
                throw new RangeError(`Index ${index} does not exist in the list.`);
            }

        }

        newNode.next = current.next;
        current.next.previous = newNode;

        current.next = newNode;
        newNode.previous = current;
    }
    insertBefore(data, index) {

        const newNode = new CircularDoublyLinkedListNode(data);

        if (this[head] === null) {
            throw new RangeError(`Index ${index} does not exist in the list.`);
        }

        if (index === 0) {

            const tail = this[head].previous;
            tail.next = newNode;
            newNode.previous = tail;
            newNode.next = this[head];
            this[head].previous = newNode;
            this[head] = newNode;
        } else {

            let current = this[head],
                previous = null;

            let i = 0;

            while ((current.next !== this[head]) && (i < index)) {
                previous = current;
                current = current.next;
                i++;
            }

            if (i < index) {
                //this.insertBefore(data, index-1)
                throw new RangeError(`Index ${index} does not exist in the list.`);

            }

            previous.next = newNode;
            newNode.previous = previous;

            newNode.next = current;
            current.previous = newNode;
        }
    }
    [Symbol.iterator]() {
        return this.values();
    }

    *values() {

        if (this[head] !== null) {
            if (this[head].next === this[head]) {
                yield this[head].data;
            } else {

                let current = this[head];

                do {
                    yield current.data;
                    current = current.next;
                } while (current !== this[head]);
            }

        }
    }
    //CLOCKWISE = next
    getNext(point){
        let index = this.indexOf(point) + 1
        if(index === this.getLength()){
            return this.get(0)
        }
        else{
            return this.get(index)
        }
    }
    //CCW = previous
    getPrevious(point){
        let index = this.indexOf(point) - 1
        if(index === -1){
            return this.get(this.getLength()-1)
        }
        else{
            return this.get(index)
        }
    }
    toArray(){
        return [...this.values()]
    }
}

// Class VertexCycle implements a cyclic double linked list, with the points stored in it ordered clockwise round a centerpoint
class VertexCycle extends CircularDoublyLinkedList {
    constructor(center){
        super();
        this.center = center;
        this.minpt = null;
    }

    calculatePseudoAngle(point){
        return geometry.pseudoAngle(geometry.ptSub(point, this.center))
    }
    insertP(point) {


        const p = this.calculatePseudoAngle(point)
        if(this.getLength()===0){
            this.add(point)
            this.minpt = p;
        } else {
            if (p < this.minpt) {
                this.insertBefore(point, 0)
                this.minpt = p;
            } else {
                var linkedArray = this.toArray();
                let i = 0;
                if(p > linkedArray[linkedArray.length-1]){
                    this.insert(point, linkedArray.length-1)
                }else {
                while (i < linkedArray.length) {
                    let currentPoint = linkedArray[i]
                    if (this.calculatePseudoAngle(currentPoint) > p) {


                        break;
                    } else {
                        i+=1;
                    }
                }this.insert(point, i-1)
                }
            }
        }
        }




    }


module.exports = {
    VertexCycle: VertexCycle
}