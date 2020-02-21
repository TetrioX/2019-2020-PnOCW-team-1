const VC = require('./CircularDoublyLinkedList')
const geometry = require('./geometry')

function merge(adj, L, R){

    while(true){


        //common lower tangent
        adj[L].insertP(R);
        adj[R].insertP(L)


        //getRightCandidate
        let rightCandidate = false
        while(true){


            const R$ = adj[R].getNext(L)

            if(geometry.rightOf(R$, [R, L])){
                rightCandidate = false;
                break;
            }

            const R$$ = adj[R].getNext(R$)
            if(!geometry.circumscribed(R$, L, R, R$$)){
                rightCandidate = R$;
                break;
            }
            adj[R].removeElement(R$)
            adj[R$].removeElement(R)
        }

        //getLeftCandidate
        let leftCandidate = false
        while(true){

            const L$ = adj[L].getPrevious(R)

            if(!geometry.rightOf(L$, [L,R])){
                leftCandidate = false
                break
            }

            const L$$ = adj[L].getPrevious(L$)
            if(!geometry.circumscribed(L$, L, R, L$$)){
                leftCandidate = L$
                break
            }
            adj[L].removeElement(L$)
            adj[L$].removeElement(L)
        }

        //No more candidates
        if(!rightCandidate && !leftCandidate){

            return adj
        }

        if(!leftCandidate){
            R = rightCandidate
        }
        else if(!rightCandidate){
            L = leftCandidate
        }
        else if(geometry.circumscribed(leftCandidate, L, R, rightCandidate)){
            R = rightCandidate
        } else {
            L = leftCandidate
        }




    }
}
export default merge
