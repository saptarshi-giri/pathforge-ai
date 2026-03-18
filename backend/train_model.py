import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Load dataset
data = pd.read_csv("dataset.csv")

# Split input and output
X = data.drop("Career", axis=1)
y = data["Career"]

# Train model
model = RandomForestClassifier()
model.fit(X, y)

print("Model trained successfully!")

# Test with sample student
sample = [[8,8,6,5,9,1,0,0]]
prediction = model.predict(sample)

print("Recommended Career:", prediction[0])
