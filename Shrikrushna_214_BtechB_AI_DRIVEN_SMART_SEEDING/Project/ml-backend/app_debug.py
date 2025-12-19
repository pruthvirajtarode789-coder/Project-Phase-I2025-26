import pandas as pd
try:
    df = pd.read_csv('e:/Smart seeding/Smart seeding/ml-backend/dataset/village_crop_yield_2000.csv')
    with open('cols.txt', 'w') as f:
        for col in df.columns:
            f.write(col + '\n')
    print("Done")
except Exception as e:
    print(e)
