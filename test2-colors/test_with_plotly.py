import plotly.express as px
import pandas as pd 

print("This is 'wide' data, unsuitable as-is for Plotly Express:")
df = pd.DataFrame(dict(bla=[5, 4, 3], wie=[1,2,3], hoe=[3,1,2]))
fig = px.scatter_3d(df, x='bla', y='wie', z='hoe')
fig.show()