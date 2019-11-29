
 
MAX = 100; 
s=""; 
const luDecomposition = function(mat, n) { 
    lower = Array.from(new Array(n), (d) => new Array(n).fill(0).splice())
    upper = Array.from(new Array(n), (d) => new Array(n).fill(0).splice())
  
    // Decomposing matrix into Upper and Lower 
    // triangular matrix 
    for (let i = 0; i < n; i++) { 
  
        // Upper Triangular 
        for (let k = i; k < n; k++) { 
  
            // Summation of L(i, j) * U(j, k) 
            sum = 0; 
            for (let j = 0; j < i; j++) sum += (lower[i][j] * upper[j][k]); 

            // Evaluating U(i, k) 
            upper[i][k] = mat[i][k] - sum; 
			// console.log("Up: ", upper)
        } 
  
        // Lower Triangular 
        for (let k = i; k < n; k++) { 
            if (i == k) lower[i][i] = 1; // Diagonal as 1 
            else { 

                // Summation of L(k, j) * U(j, i) 
                sum = 0; 
                for (let j = 0; j < i; j++) sum += (lower[k][j] * upper[j][i]); 
				
                // Evaluating L(k, i) 
                lower[k][i] = upper[i][i] != 0 ? (mat[k][i] - sum) / upper[i][i] : (mat[k][i] - sum) / 10**(-10); 
            } 
			// console.log("Low: ", lower)
        } 
    } 
	
	// console.log(lower, " ", upper)
	return { L: lower, U: upper }
} 

module.exports = {
	luDecomposition: luDecomposition
}
