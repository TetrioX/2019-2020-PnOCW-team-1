var CircularDoublyLinkedList = require('./CircularDoublyLinkedList')


function VertexCycle(center){
    const linkedCycle = new CircularDoublyLinkedList;
    const model ={
        center,
        cycle: linkedCycle,

    }
    function CW(data){
        let index = model.cycle.indexOf(data);

    }
}